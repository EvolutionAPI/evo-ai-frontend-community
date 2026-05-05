#!/usr/bin/env node
// Copies @ffmpeg/core umd build into public/ffmpeg/ so it can be served
// from the same origin instead of a third-party CDN (no SRI / supply-chain risk).
// The umd build is single-thread, so it does NOT require SharedArrayBuffer
// or COOP/COEP cross-origin isolation headers.
import { mkdirSync, copyFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'umd');
const dest = join(root, 'public', 'ffmpeg');

const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm'];

if (!existsSync(src)) {
  // node_modules not installed yet (e.g., first install pre-deps). Skip silently.
  console.warn('[copy-ffmpeg-core] @ffmpeg/core not found in node_modules — skipping. Run `npm install` then `npm run copy-ffmpeg-core`.');
  process.exit(0);
}

mkdirSync(dest, { recursive: true });
for (const file of files) {
  const from = join(src, file);
  const to = join(dest, file);
  if (!existsSync(from)) {
    console.error(`[copy-ffmpeg-core] missing ${from}`);
    process.exit(1);
  }
  copyFileSync(from, to);
  const size = (statSync(to).size / (1024 * 1024)).toFixed(2);
  console.log(`[copy-ffmpeg-core] ${file} → public/ffmpeg/ (${size} MB)`);
}
