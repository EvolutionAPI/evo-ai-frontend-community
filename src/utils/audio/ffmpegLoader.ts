import { createFFmpeg } from '@ffmpeg/ffmpeg';
import type { FFmpeg } from '@ffmpeg/ffmpeg';

/** Maximum recording length before UI cap warning (5 min). */
export const FFMPEG_MAX_RECORDING_SECONDS = 300;

const LOAD_TIMEOUT_MS = 30_000;

let _instance: FFmpeg | null = null;
let _loadPromise: Promise<void> | null = null;

/**
 * Pre-loads the self-hosted FFmpeg WASM singleton.
 * Safe to call multiple times — returns the same promise while loading.
 * Throws on timeout (> 30 s) or WASM load failure.
 */
export async function preloadFfmpeg(): Promise<void> {
  if (_instance?.isLoaded()) return;
  if (_loadPromise) return _loadPromise;

  const ffmpeg = createFFmpeg({
    corePath: '/ffmpeg/ffmpeg-core.js',
    log: false,
  });

  _loadPromise = Promise.race<void>([
    ffmpeg.load(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('FFmpeg load timeout')), LOAD_TIMEOUT_MS),
    ),
  ])
    .then(() => {
      _instance = ffmpeg;
    })
    .catch(err => {
      _loadPromise = null;
      throw err;
    });

  return _loadPromise;
}

/**
 * Terminates the FFmpeg WASM instance and frees its memory (~25–30 MB).
 * Call this on AudioRecorder unmount to prevent memory leaks.
 */
export function terminateFfmpeg(): void {
  if (_instance) {
    try {
      _instance.exit();
    } catch {
      // ignore – already exited
    }
    _instance = null;
  }
  _loadPromise = null;
}

/** Returns the loaded FFmpeg instance, or null if not yet loaded. */
export function getFfmpegInstance(): FFmpeg | null {
  return _instance?.isLoaded() ? _instance : null;
}
