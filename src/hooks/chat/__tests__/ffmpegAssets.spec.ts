import { describe, it, expect } from 'vitest';
import { existsSync, statSync, readFileSync } from 'node:fs';
import path from 'node:path';

// These tests guard the FFmpeg WASM self-hosting pipeline (vite.config.ts +
// useAudioRecorder.ts). They catch the exact regressions that have bitten us:
//
//   1. core-st@0.11.1 shipped a 0-byte ffmpeg-core.worker.js, which makes
//      _locateFile call atob('') and throw InvalidCharacterError at runtime.
//   2. The multi-thread @ffmpeg/core requires SharedArrayBuffer (COOP+COEP),
//      which our SPA does not have — silently picking it up breaks recording.
//   3. The vite plugin (ffmpegCorePlugin) lists the files it serves; if that
//      list drifts from what the package actually ships, /ffmpeg/<file> 404s.

const ROOT = path.resolve(__dirname, '../../../..');
const CORE_ST_DIR = path.join(ROOT, 'node_modules/@ffmpeg/core-st/dist');
const VITE_CONFIG = path.join(ROOT, 'vite.config.ts');

describe('@ffmpeg/core-st package shape', () => {
  it('ships a non-empty ffmpeg-core.js', () => {
    const p = path.join(CORE_ST_DIR, 'ffmpeg-core.js');
    expect(existsSync(p), `missing ${p}`).toBe(true);
    expect(statSync(p).size).toBeGreaterThan(1024);
  });

  it('ships a non-empty ffmpeg-core.wasm', () => {
    const p = path.join(CORE_ST_DIR, 'ffmpeg-core.wasm');
    expect(existsSync(p), `missing ${p}`).toBe(true);
    // The real WASM is ~23MB; anything under 1MB means a broken tarball.
    expect(statSync(p).size).toBeGreaterThan(1024 * 1024);
  });

  it('does NOT ship a worker file (single-thread mode)', () => {
    // 0.11.1 added a 0-byte worker placeholder that breaks _locateFile.
    // Pure single-thread (0.11.0) ships only .js + .wasm — see vite.config.ts.
    const worker = path.join(CORE_ST_DIR, 'ffmpeg-core.worker.js');
    if (existsSync(worker)) {
      // If a worker file ever appears here, fail loudly and require manual review.
      expect.fail(
        `Unexpected ffmpeg-core.worker.js at ${worker} (size: ${statSync(worker).size}B). ` +
          `core-st@0.11.0 should not ship a worker. If you upgraded, verify the file is non-empty ` +
          `AND update FFMPEG_FILES in vite.config.ts to include it.`,
      );
    }
  });
});

describe('vite.config.ts ffmpeg plugin wiring', () => {
  const config = readFileSync(VITE_CONFIG, 'utf8');

  it('points FFMPEG_CORE_DIR at @ffmpeg/core-st (single-thread)', () => {
    // Multi-thread @ffmpeg/core requires SharedArrayBuffer which we don't ship.
    expect(config).toMatch(/FFMPEG_CORE_DIR\s*=\s*path\.resolve\([^)]*@ffmpeg\/core-st\/dist/);
    expect(config).not.toMatch(/FFMPEG_CORE_DIR\s*=\s*path\.resolve\([^)]*@ffmpeg\/core\/dist/);
  });

  it('FFMPEG_FILES lists exactly the files the package ships', () => {
    const match = config.match(/FFMPEG_FILES\s*=\s*\[([^\]]+)\]/);
    expect(match, 'could not find FFMPEG_FILES in vite.config.ts').toBeTruthy();
    const declared = (match![1].match(/'([^']+)'/g) || []).map(s => s.slice(1, -1)).sort();

    const shipped = ['ffmpeg-core.js', 'ffmpeg-core.wasm'].filter(f =>
      existsSync(path.join(CORE_ST_DIR, f)),
    );

    expect(declared).toEqual(shipped.sort());
  });
});

describe('@ffmpeg/core (multi-thread) is NOT a dependency', () => {
  it('package.json does not declare @ffmpeg/core', () => {
    const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    // @ffmpeg/core (without -st) requires SharedArrayBuffer at runtime —
    // accidentally adding it back will pass build but fail in the browser.
    expect(deps['@ffmpeg/core']).toBeUndefined();
  });
});
