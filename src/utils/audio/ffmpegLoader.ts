import { createFFmpeg } from '@ffmpeg/ffmpeg';
import type { FFmpeg } from '@ffmpeg/ffmpeg';

/** Maximum recording length before UI cap warning (5 min). */
export const FFMPEG_MAX_RECORDING_SECONDS = 300;

const LOAD_TIMEOUT_MS = 30_000;

let _instance: FFmpeg | null = null;
let _loadPromise: Promise<void> | null = null;
let _refCount = 0;

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
 * Acquires a reference to the FFmpeg singleton, pre-loading it if needed.
 * Pair with releaseFfmpeg() in cleanup — only the last release calls exit().
 */
export async function acquireFfmpeg(): Promise<void> {
  _refCount += 1;
  await preloadFfmpeg();
}

/**
 * Releases a reference to the FFmpeg singleton. When refCount reaches 0,
 * the WASM instance is terminated to free its memory (~25–30 MB).
 */
export function releaseFfmpeg(): void {
  _refCount = Math.max(0, _refCount - 1);
  if (_refCount === 0) terminateFfmpeg();
}

/**
 * Forcibly terminates the FFmpeg WASM instance and frees its memory.
 * Prefer acquireFfmpeg/releaseFfmpeg in components — only call this directly
 * if you own the singleton lifecycle (e.g. global app teardown).
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
  _refCount = 0;
}

/** Returns the loaded FFmpeg instance, or null if not yet loaded. */
export function getFfmpegInstance(): FFmpeg | null {
  return _instance?.isLoaded() ? _instance : null;
}
