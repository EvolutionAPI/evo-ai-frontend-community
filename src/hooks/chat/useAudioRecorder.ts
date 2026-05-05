import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

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

// FFmpeg WASM singleton with reference counting — loaded once on demand,
// shared across hook instances, terminated when the last consumer unmounts.
//
// Self-hosted single-thread umd core is copied from `@ffmpeg/core` into
// `public/ffmpeg/` at install/build time (see `scripts/copy-ffmpeg-core.mjs`).
// Override the base URL via `VITE_FFMPEG_BASE_URL` if serving from a CDN under
// your control. We never load FFmpeg from a third-party CDN — that would mean
// running unpinned third-party code in an authenticated CRM session.
const FFMPEG_BASE_URL =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_FFMPEG_BASE_URL || '/ffmpeg';
const FFMPEG_LOAD_TIMEOUT_MS = 30_000;

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<FFmpeg> | null = null;
let ffmpegRefCount = 0;

const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
    promise.then(
      value => {
        clearTimeout(timer);
        resolve(value);
      },
      err => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });

const loadFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpegInstance) return ffmpegInstance;
  if (ffmpegLoadPromise) return ffmpegLoadPromise;

  ffmpegLoadPromise = (async () => {
    const ffmpeg = new FFmpeg();
    const base = FFMPEG_BASE_URL.replace(/\/$/, '');
    try {
      const [coreURL, wasmURL] = await Promise.all([
        withTimeout(
          toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
          FFMPEG_LOAD_TIMEOUT_MS,
          'FFmpeg core download',
        ),
        withTimeout(
          toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
          FFMPEG_LOAD_TIMEOUT_MS,
          'FFmpeg wasm download',
        ),
      ]);
      await withTimeout(
        ffmpeg.load({ coreURL, wasmURL }),
        FFMPEG_LOAD_TIMEOUT_MS,
        'FFmpeg init',
      );
      ffmpegInstance = ffmpeg;
      return ffmpeg;
    } catch (err) {
      ffmpegLoadPromise = null;
      throw err;
    }
  })();

  return ffmpegLoadPromise;
};

const terminateFFmpegIfIdle = () => {
  if (ffmpegRefCount > 0) return;
  if (ffmpegInstance) {
    try {
      ffmpegInstance.terminate();
    } catch {
      // best effort
    }
  }
  ffmpegInstance = null;
  ffmpegLoadPromise = null;
};

const convertToOggOpus = async (inputBlob: Blob): Promise<Blob> => {
  const ffmpeg = await loadFFmpeg();

  const mime = inputBlob.type;
  const ext = mime.includes('mp4') ? 'm4a' : mime.includes('ogg') ? 'ogg' : 'webm';
  // Per-call unique filenames to avoid clashes if conversions ever overlap
  // (e.g. multiple tabs sharing the singleton via memory pressure won't happen
  // across tabs, but two recordings finishing concurrently in one tab would).
  const id = Math.random().toString(36).slice(2, 10);
  const inputName = `input-${id}.${ext}`;
  const outputName = `output-${id}.ogg`;

  await ffmpeg.writeFile(inputName, await fetchFile(inputBlob));

  try {
    await ffmpeg.exec([
      '-i', inputName,
      '-vn',
      '-c:a', 'libopus',
      '-b:a', '48k',
      '-ar', '48000',
      '-ac', '1',
      '-avoid_negative_ts', 'make_zero',
      '-write_xing', '0',
      '-compression_level', '10',
      '-application', 'voip',
      '-fflags', '+bitexact',
      '-flags', '+bitexact',
      '-id3v2_version', '0',
      '-map_metadata', '-1',
      '-map_chapters', '-1',
      '-write_bext', '0',
      outputName,
    ]);

    const data = await ffmpeg.readFile(outputName);
    return new Blob([new Uint8Array(data as Uint8Array)], { type: 'audio/ogg' });
  } finally {
    try {
      await ffmpeg.deleteFile(inputName);
    } catch {
      /* ignore */
    }
    try {
      await ffmpeg.deleteFile(outputName);
    } catch {
      /* ignore */
    }
  }
};

export const useAudioRecorder = (options?: UseAudioRecorderOptions): UseAudioRecorderReturn => {
  const preferWhatsAppCloudFormat = options?.preferWhatsAppCloudFormat === true;
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingData, setRecordingData] = useState<AudioRecordingData | null>(null);

  // Ref-count the FFmpeg WASM singleton: each hook consumer counts as one
  // reference; when the last consumer unmounts we terminate the WASM heap.
  // Prevents the ~30 MB instance from leaking for the lifetime of the SPA.
  useEffect(() => {
    if (!preferWhatsAppCloudFormat) return;
    ffmpegRefCount += 1;
    return () => {
      ffmpegRefCount = Math.max(0, ffmpegRefCount - 1);
      if (ffmpegRefCount === 0) terminateFFmpegIfIdle();
    };
  }, [preferWhatsAppCloudFormat]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0); // Tempo acumulado em pausas
  const pauseStartRef = useRef<number>(0); // Quando pausou
  const isPausedRef = useRef<boolean>(false); // Ref para estado de pausa
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const selectedMimeTypeRef = useRef<string>('audio/webm;codecs=opus');

  // TRAVA GLOBAL ANTI-DUPLICAÇÃO
  const isInitializingRef = useRef<boolean>(false);

  // Verificar se navegador suporta MediaRecorder
  const isSupported =
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getUserMedia' in navigator.mediaDevices &&
    typeof MediaRecorder !== 'undefined';

  // Gerar ID único para arquivo
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getSupportedRecordingMimeType = () => {
    const preferredMimeTypes = preferWhatsAppCloudFormat
      ? ['audio/ogg;codecs=opus', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/webm']
      : ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

    const supported = preferredMimeTypes.find(mimeType => MediaRecorder.isTypeSupported(mimeType));
    return supported || '';
  };

  const normalizeMimeType = (mimeType: string) => mimeType.split(';')[0] || 'audio/webm';

  const getFileExtensionFromMimeType = (mimeType: string) => {
    if (mimeType.includes('audio/ogg')) return 'ogg';
    if (mimeType.includes('audio/mp4')) return 'm4a';
    return 'webm';
  };

  // Monitorar nível de áudio
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkLevel = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calcular nível médio
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const normalizedLevel = average / 255; // Normalizar para 0-1

      setAudioLevel(normalizedLevel);

      if (isRecording && !isPaused) {
        animationFrameRef.current = requestAnimationFrame(checkLevel);
      }
    };

    checkLevel();
  }, [isRecording, isPaused]);

  // Iniciar gravação
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      toast.error('Seu navegador não suporta gravação de áudio');
      return;
    }

    // PROTEÇÃO ROBUSTA CONTRA MÚLTIPLAS GRAVAÇÕES
    if (isRecording || mediaRecorderRef.current || isInitializingRef.current) {
      return;
    }

    // MARCAR COMO INICIALIZANDO
    isInitializingRef.current = true;

    try {
      // Solicitar permissão de microfone (MONO para reduzir tamanho)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1, // FORÇAR MONO
          sampleRate: preferWhatsAppCloudFormat ? 48000 : undefined, // alvo WhatsApp Cloud
        },
      });

      streamRef.current = stream;

      // Configurar analisador de áudio
      const AudioContextConstructor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextConstructor();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Configurar MediaRecorder com prioridade para formatos mais compatíveis com WhatsApp Cloud
      const selectedMimeType = getSupportedRecordingMimeType();
      selectedMimeTypeRef.current = selectedMimeType || 'audio/webm;codecs=opus';
      const mediaRecorderOptions = {
        audioBitsPerSecond: preferWhatsAppCloudFormat ? 128000 : 64000,
      } as MediaRecorderOptions;
      if (selectedMimeType) {
        mediaRecorderOptions.mimeType = selectedMimeType;
      }
      const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          // USAR A DURAÇÃO ARMAZENADA NO MEDIARECORDER
          const storedDuration = (mediaRecorderRef.current as any)?.__finalDuration;
          const finalDuration = storedDuration || duration;

          const recordedMimeType = normalizeMimeType(selectedMimeTypeRef.current);
          const recordedBlob = new Blob(chunksRef.current, { type: recordedMimeType });

          // When WhatsApp Cloud format is requested, convert to OGG/Opus via FFmpeg WASM
          // so the audio arrives as a native PTT voice message instead of a generic attachment.
          // Skip conversion if the browser already recorded natively in OGG (e.g. Firefox).
          let outputBlob: Blob = recordedBlob;
          let outputMime = recordedMimeType;
          let outputExt = getFileExtensionFromMimeType(recordedMimeType);

          if (preferWhatsAppCloudFormat && !recordedMimeType.includes('ogg')) {
            try {
              outputBlob = await convertToOggOpus(recordedBlob);
              outputMime = 'audio/ogg';
              outputExt = 'ogg';
            } catch (convErr) {
              console.warn(
                '[AudioRecorder] OGG conversion failed, sending original format:',
                convErr,
              );
              // Surface the failure: without OGG/Opus, WhatsApp Cloud delivers
              // the audio as a generic file attachment, not a native voice
              // message. Don't fail silently — that's what EVO-979 was about.
              toast.warning(
                'Conversor de áudio indisponível — o áudio será enviado como anexo.',
              );
              // outputBlob / outputMime / outputExt stay as recorded values
            }
          }

          const fileName = `audio_${generateId()}.${outputExt}`;
          const finalBlob = new File([outputBlob], fileName, {
            type: outputMime,
            lastModified: Date.now(),
          });

          (finalBlob as any).__duration = finalDuration;

          const url = URL.createObjectURL(finalBlob);

          const audioData: AudioRecordingData = {
            blob: finalBlob,
            url,
            duration: finalDuration,
            file: finalBlob,
          };

          setRecordingData(audioData);
          setHasRecording(true);
        } catch {
          toast.error('Erro ao processar gravação de áudio');

          // Fallback: usar blob original sem conversão
          const finalDuration = duration;
          const mimeType = normalizeMimeType(selectedMimeTypeRef.current);
          const extension = getFileExtensionFromMimeType(mimeType);
          const recordedBlob = new Blob(chunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(recordedBlob);
          const fileName = `audio_${generateId()}.${extension}`;
          const file = new File([recordedBlob], fileName, { type: mimeType });

          const audioData: AudioRecordingData = {
            blob: recordedBlob,
            url,
            duration: finalDuration,
            file,
          };

          setRecordingData(audioData);
          setHasRecording(true);
        }

        // Limpar recursos
        setIsRecording(false);
        setIsPaused(false);
        setAudioLevel(0);

        // LIMPAR MEDIARECORDER
        mediaRecorderRef.current = null;

        // Limpar stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Limpar contexto de áudio
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }

        // Limpar intervalos
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };

      mediaRecorder.onerror = event => {
        console.error('Erro na gravação:', event);
        toast.error('Erro durante a gravação de áudio');
        stopRecording();
      };

      // Iniciar gravação
      mediaRecorder.start(1000); // Coletar dados a cada 1 segundo
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0; // Reset tempo pausado
      pauseStartRef.current = 0; // Reset início da pausa
      isPausedRef.current = false; // Reset ref de pausa

      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setHasRecording(false);

      // LIBERAR TRAVA - GRAVAÇÃO INICIADA COM SUCESSO
      isInitializingRef.current = false;

      // Iniciar timer
      durationIntervalRef.current = setInterval(() => {
        if (startTimeRef.current && !isPausedRef.current) {
          const elapsed = (Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000;
          setDuration(elapsed);
        }
      }, 100); // Atualizar a cada 100ms para suavidade
      setRecordingData(null);

      // Iniciar monitoramento
      monitorAudioLevel();
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      toast.error('Erro ao acessar o microfone. Verifique as permissões.');

      // LIBERAR TRAVA EM CASO DE ERRO
      isInitializingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported, preferWhatsAppCloudFormat]);

  // Parar gravação
  const stopRecording = useCallback(() => {
    // CAPTURAR DURAÇÃO ATUAL ANTES DE PARAR TUDO
    const currentDuration = startTimeRef.current
      ? (Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000
      : duration;

    if (mediaRecorderRef.current && isRecording) {
      // Armazenar duração final ANTES de parar o MediaRecorder
      (mediaRecorderRef.current as any).__finalDuration = currentDuration;
      mediaRecorderRef.current.stop();
    }

    // Resetar estados
    isPausedRef.current = true; // Para o timer imediatamente

    // Limpar timer quando parar
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [isRecording, duration]);

  // Pausar gravação
  const pauseRecording = useCallback(() => {
    if (isRecording && !isPaused) {
      setIsPaused(true);
      isPausedRef.current = true;

      // Registrar quando pausou
      pauseStartRef.current = Date.now();
    }
  }, [isRecording, isPaused, duration]);

  // Retomar gravação
  const resumeRecording = useCallback(() => {
    if (isRecording && isPaused) {
      setIsPaused(false);
      isPausedRef.current = false;

      // Acumular tempo pausado
      if (pauseStartRef.current > 0) {
        const pauseDuration = Date.now() - pauseStartRef.current;
        pausedTimeRef.current += pauseDuration;
        pauseStartRef.current = 0;
      }
    }
  }, [isRecording, isPaused]);

  // Deletar gravação
  const deleteRecording = useCallback(() => {
    if (recordingData) {
      URL.revokeObjectURL(recordingData.url);
    }

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
