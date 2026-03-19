import lamejs from '@breezystack/lamejs';

const writeString = (view: DataView, offset: number, string: string): void => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const bufferToWav = async (
  buffer: AudioBuffer,
  numChannels: number,
  sampleRate: number,
): Promise<Blob> => {
  const length = buffer.length * numChannels * 2;
  const wav = new ArrayBuffer(44 + length);
  const view = new DataView(wav);

  // WAV Header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // WAV Data
  const offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      view.setInt16(offset + (i * numChannels + channel) * 2, sample * 0x7fff, true);
    }
  }

  return new Blob([wav], { type: 'audio/wav' });
};

const decodeAudioData = async (audioBlob: Blob): Promise<AudioBuffer> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioData = await audioContext.decodeAudioData(arrayBuffer);
  return audioData;
};

export const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
  const audioBuffer = await decodeAudioData(audioBlob);
  return bufferToWav(audioBuffer, audioBuffer.numberOfChannels, audioBuffer.sampleRate);
};

/**
 * Encodes audio samples to MP3 format.
 * @param channels - Number of audio channels.
 * @param sampleRate - Sample rate in Hz.
 * @param samples - Audio samples to be encoded.
 * @param bitrate - MP3 bitrate (default: 128)
 * @returns The MP3 encoded audio as a Blob.
 */
export const encodeToMP3 = (
  channels: number,
  sampleRate: number,
  samples: Int16Array,
  bitrate: number = 128,
): Blob => {
  const outputBuffer: Int8Array[] = [];
  const encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitrate);
  const maxSamplesPerFrame = 1152;

  for (let offset = 0; offset < samples.length; offset += maxSamplesPerFrame) {
    const sliceEnd = Math.min(offset + maxSamplesPerFrame, samples.length);
    const sampleSlice = samples.subarray(offset, sliceEnd);
    const mp3Buffer = encoder.encodeBuffer(sampleSlice);

    if (mp3Buffer.length > 0) {
      outputBuffer.push(new Int8Array(mp3Buffer));
    }
  }

  const remainingData = encoder.flush();
  if (remainingData.length > 0) {
    outputBuffer.push(new Int8Array(remainingData));
  }

  return new Blob(outputBuffer, { type: 'audio/mp3' });
};

/**
 * Converts an audio Blob to an MP3 format Blob.
 * @param audioBlob - The audio data as a Blob.
 * @param bitrate - MP3 bitrate (default: 128)
 * @returns A Blob containing the MP3 encoded audio.
 */
export const convertToMp3 = async (audioBlob: Blob, bitrate: number = 128): Promise<Blob> => {
  try {
    const audioBuffer = await decodeAudioData(audioBlob);

    const samplesLength = audioBuffer.length * audioBuffer.numberOfChannels;
    const samples = new Int16Array(samplesLength);

    let offset = 0;
    for (let i = 0; i < audioBuffer.length; i += 1) {
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
        samples[offset] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        offset += 1;
      }
    }

    const mp3Blob = encodeToMP3(
      audioBuffer.numberOfChannels,
      audioBuffer.sampleRate,
      samples,
      bitrate,
    );

    return mp3Blob;
  } catch (error) {
    console.error('🎵 [MP3] Erro na conversão:', error);
    throw new Error('Conversion to MP3 failed.');
  }
};

/**
 * Converte áudio para o formato especificado
 * @param inputBlob - Blob de áudio de entrada
 * @param outputFormat - Formato de saída ('audio/wav' | 'audio/mp3')
 * @param bitrate - Bitrate para MP3 (padrão: 128)
 * @returns Blob convertido
 */
export const convertAudio = async (
  inputBlob: Blob,
  outputFormat: 'audio/wav' | 'audio/mp3',
  bitrate: number = 128,
): Promise<Blob> => {

  let audio: Blob;
  if (outputFormat === 'audio/wav') {
    audio = await convertToWav(inputBlob);
  } else if (outputFormat === 'audio/mp3') {
    audio = await convertToMp3(inputBlob, bitrate);
  } else {
    throw new Error('Unsupported output format');
  }

  return audio;
};
