import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import Recorder from 'opus-recorder';

export interface AudioRecordingData {
  blob: Blob;
  url: string;
  duration: number;
  file: File;
}

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  hasRecording: boolean;
  recordingData: AudioRecordingData | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  deleteRecording: () => void;
  isSupported: boolean;
}

interface UseAudioRecorderOptions {
  preferWhatsAppCloudFormat?: boolean;
}

// opus-recorder encodes PCM straight from the mic into OGG/Opus during capture
// (no post-processing). The config below matches the FFmpeg flags we previously
// used to produce a WhatsApp-Cloud-compliant PTT voice message:
//
//   ffmpeg -c:a libopus -b:a 48k -ar 48000 -ac 1 -application voip
//          -compression_level 10 -map_metadata -1
//
// Mapping:
//   encoderApplication: 2048   ← -application voip
//   encoderSampleRate: 48000   ← -ar 48000
//   encoderBitRate: 48000      ← -b:a 48k
//   numberOfChannels: 1        ← -ac 1
//   encoderComplexity: 10      ← -compression_level 10
//
// Result: stop() yields a Blob({ type: 'audio/ogg' }) ready to send to Cloud.
// The encoder worker (encoderWorker.min.js) is self-hosted via vite plugin
// `opusRecorderPlugin`. It is a single ~376KB JS file with libopusenc bundled
// as inline base64 WASM — no SharedArrayBuffer / COOP+COEP required.
const PTT_OPUS_CONFIG = {
  encoderApplication: 2048,
  encoderSampleRate: 48000,
  encoderBitRate: 48000,
  numberOfChannels: 1,
  encoderComplexity: 10,
  streamPages: true,
  rawOpus: false,
} as const;

const OPUS_ENCODER_PATH = '/opus-recorder/encoderWorker.min.js';

export const useAudioRecorder = (options?: UseAudioRecorderOptions): UseAudioRecorderReturn => {
  const preferWhatsAppCloudFormat = options?.preferWhatsAppCloudFormat === true;
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingData, setRecordingData] = useState<AudioRecordingData | null>(null);

  // opus-recorder path
  const opusRecorderRef = useRef<Recorder | null>(null);
  const opusChunksRef = useRef<Uint8Array[]>([]);

  // MediaRecorder path (non-PTT — voice notes, transcription, etc.)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const selectedMimeTypeRef = useRef<string>('audio/webm;codecs=opus');

  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const finalDurationRef = useRef<number>(0);

  const isInitializingRef = useRef<boolean>(false);

  const isSupported =
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getUserMedia' in navigator.mediaDevices &&
    typeof MediaRecorder !== 'undefined';

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getSupportedRecordingMimeType = () => {
    const preferredMimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
    return preferredMimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || '';
  };

  const normalizeMimeType = (mimeType: string) => mimeType.split(';')[0] || 'audio/webm';

  const getFileExtensionFromMimeType = (mimeType: string) => {
    if (mimeType.includes('audio/ogg')) return 'ogg';
    if (mimeType.includes('audio/mp4')) return 'm4a';
    return 'webm';
  };

  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
      setAudioLevel(sum / bufferLength / 255);
      if (isRecording && !isPaused) {
        animationFrameRef.current = requestAnimationFrame(checkLevel);
      }
    };
    checkLevel();
  }, [isRecording, isPaused]);

  const cleanupResources = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const buildRecordingData = (blob: Blob, mimeType: string, ext: string): AudioRecordingData => {
    const fileName = `audio_${generateId()}.${ext}`;
    const file = new File([blob], fileName, { type: mimeType, lastModified: Date.now() });
    (file as unknown as { __duration?: number }).__duration = finalDurationRef.current;
    return {
      blob: file,
      url: URL.createObjectURL(file),
      duration: finalDurationRef.current,
      file,
    };
  };

  const startOpusRecording = async (stream: MediaStream) => {
    opusChunksRef.current = [];
    const recorder = new Recorder({
      ...PTT_OPUS_CONFIG,
      encoderPath: OPUS_ENCODER_PATH,
      // Reuse the stream we already opened (so we don't prompt the user twice
      // and the analyser node sees the same audio).
      mediaTrackConstraints: false,
    });

    recorder.ondataavailable = (chunk: Uint8Array) => {
      // streamPages: true delivers OGG pages as they are produced.
      opusChunksRef.current.push(chunk);
    };

    // opus-recorder accepts an external MediaStream via sourceNode. We connect
    // the existing stream to the recorder's audioContext to keep the analyser
    // in sync.
    const audioContext = new AudioContext();
    const sourceNode = audioContext.createMediaStreamSource(stream);
    audioContextRef.current = audioContext;

    await recorder.start(sourceNode);
    opusRecorderRef.current = recorder;
  };

  const startMediaRecorderRecording = (stream: MediaStream) => {
    mediaChunksRef.current = [];
    const selectedMimeType = getSupportedRecordingMimeType();
    selectedMimeTypeRef.current = selectedMimeType || 'audio/webm;codecs=opus';

    const opts: MediaRecorderOptions = { audioBitsPerSecond: 64000 };
    if (selectedMimeType) opts.mimeType = selectedMimeType;

    const mr = new MediaRecorder(stream, opts);
    mr.ondataavailable = e => {
      if (e.data.size > 0) mediaChunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      const mimeType = normalizeMimeType(selectedMimeTypeRef.current);
      const ext = getFileExtensionFromMimeType(mimeType);
      const blob = new Blob(mediaChunksRef.current, { type: mimeType });
      setRecordingData(buildRecordingData(blob, mimeType, ext));
      setHasRecording(true);
      setIsRecording(false);
      setIsPaused(false);
      setAudioLevel(0);
      mediaRecorderRef.current = null;
      cleanupResources();
    };
    mr.onerror = ev => {
      console.error('Erro na gravação:', ev);
      toast.error('Erro durante a gravação de áudio');
      stopRecording();
    };
    mr.start(1000);
    mediaRecorderRef.current = mr;
  };

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      toast.error('Seu navegador não suporta gravação de áudio');
      return;
    }
    if (isRecording || mediaRecorderRef.current || opusRecorderRef.current || isInitializingRef.current) {
      return;
    }
    isInitializingRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: preferWhatsAppCloudFormat ? 48000 : undefined,
        },
      });
      streamRef.current = stream;

      if (preferWhatsAppCloudFormat) {
        await startOpusRecording(stream);
      } else {
        startMediaRecorderRecording(stream);
      }

      // Analyser for level monitoring — separate context when MediaRecorder
      // path; opus path reuses the recorder's context.
      if (!audioContextRef.current) {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new Ctor();
      }
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      audioContextRef.current.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;

      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      pauseStartRef.current = 0;
      isPausedRef.current = false;

      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setHasRecording(false);
      setRecordingData(null);

      isInitializingRef.current = false;

      durationIntervalRef.current = setInterval(() => {
        if (startTimeRef.current && !isPausedRef.current) {
          setDuration((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
        }
      }, 100);
      monitorAudioLevel();
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      toast.error('Erro ao acessar o microfone. Verifique as permissões.');
      isInitializingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported, preferWhatsAppCloudFormat]);

  const stopRecording = useCallback(() => {
    finalDurationRef.current = startTimeRef.current
      ? (Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000
      : duration;

    if (opusRecorderRef.current) {
      const recorder = opusRecorderRef.current;
      opusRecorderRef.current = null;
      // Recorder.stop() returns a promise that resolves once the encoder has
      // flushed its final pages — only then is opusChunksRef complete.
      recorder
        .stop()
        .then(() => {
          const totalSize = opusChunksRef.current.reduce((acc, c) => acc + c.byteLength, 0);
          const merged = new Uint8Array(totalSize);
          let offset = 0;
          for (const chunk of opusChunksRef.current) {
            merged.set(chunk, offset);
            offset += chunk.byteLength;
          }
          const blob = new Blob([merged], { type: 'audio/ogg' });
          setRecordingData(buildRecordingData(blob, 'audio/ogg', 'ogg'));
          setHasRecording(true);
          setIsRecording(false);
          setIsPaused(false);
          setAudioLevel(0);
          cleanupResources();
        })
        .catch(err => {
          console.error('opus-recorder stop failed', err);
          toast.error('Erro ao processar gravação de áudio');
          setIsRecording(false);
          cleanupResources();
        });
    } else if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    isPausedRef.current = true;
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [isRecording, duration]);

  const pauseRecording = useCallback(() => {
    if (isRecording && !isPaused) {
      setIsPaused(true);
      isPausedRef.current = true;
      pauseStartRef.current = Date.now();
      if (opusRecorderRef.current) opusRecorderRef.current.pause();
      else if (mediaRecorderRef.current) mediaRecorderRef.current.pause();
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (isRecording && isPaused) {
      setIsPaused(false);
      isPausedRef.current = false;
      if (pauseStartRef.current > 0) {
        pausedTimeRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = 0;
      }
      if (opusRecorderRef.current) opusRecorderRef.current.resume();
      else if (mediaRecorderRef.current) mediaRecorderRef.current.resume();
    }
  }, [isRecording, isPaused]);

  const deleteRecording = useCallback(() => {
    if (recordingData) URL.revokeObjectURL(recordingData.url);
    setRecordingData(null);
    setHasRecording(false);
    setDuration(0);
    setAudioLevel(0);
  }, [recordingData]);

  return {
    isRecording,
    isPaused,
    duration,
    audioLevel,
    hasRecording,
    recordingData,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    deleteRecording,
    isSupported,
  };
};
