import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFile, mkdir } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import type { Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// FFmpeg WASM is loaded by useAudioRecorder to convert recorded webm → ogg/opus
// before sending audio to WhatsApp Cloud (Meta API rejects audio/webm). We pin
// @ffmpeg/core-st@0.11.0 (single-thread) — the multi-thread @ffmpeg/core requires
// SharedArrayBuffer / COOP+COEP cross-origin isolation, which we don't ship
// because it breaks cross-origin asset fetches from the Rails backend.
//
// Note: 0.11.0 ships only 2 files (no worker). 0.11.1 added a 0-byte worker
// placeholder that breaks _locateFile with InvalidCharacterError. Stay on 0.11.0.
//
// Assets are self-hosted so we don't depend on unpkg.com (which started
// returning 404 for the pinned version and is blocked by CORS anyway).
const FFMPEG_CORE_DIR = path.resolve(__dirname, 'node_modules/@ffmpeg/core-st/dist');
const FFMPEG_FILES = ['ffmpeg-core.js', 'ffmpeg-core.wasm'];

function ffmpegCorePlugin(): Plugin {
  return {
    name: 'ffmpeg-core-self-host',
    configureServer(server) {
      // Serve /ffmpeg/<file> from node_modules during dev.
      server.middlewares.use('/ffmpeg', (req, res, next) => {
        const file = (req.url || '/').replace(/^\/+/, '').split('?')[0];
        if (!FFMPEG_FILES.includes(file)) return next();
        const filePath = path.join(FFMPEG_CORE_DIR, file);
        if (!existsSync(filePath)) return next();
        res.setHeader(
          'Content-Type',
          file.endsWith('.wasm') ? 'application/wasm' : 'text/javascript',
        );
        // Same-origin → no CORS dance, but be permissive for dev tooling.
        res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
        createReadStream(filePath).pipe(res);
      });
    },
    async writeBundle(options) {
      // Copy the assets into dist/ffmpeg/ so the production bundle ships
      // the WASM alongside the SPA.
      const outDir = options.dir ?? path.resolve(__dirname, 'dist');
      const dest = path.join(outDir, 'ffmpeg');
      await mkdir(dest, { recursive: true });
      await Promise.all(
        FFMPEG_FILES.map(file =>
          copyFile(path.join(FFMPEG_CORE_DIR, file), path.join(dest, file)),
        ),
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ffmpegCorePlugin(),
  ],
  build: {
    // Reduce chunking to minimize requests via ngrok
    rollupOptions: {
      output: {
        manualChunks: undefined, // Disable auto chunking
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@services': path.resolve(__dirname, './src/services'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    host: true, // Listen on all addresses
    port: 5173,
    strictPort: true,
    allowedHosts: true, // Allow all hosts (like evolution-hub)
    cors: true, // Enable CORS for ngrok
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      // NOTE: COOP/COEP removed — @ffmpeg/core-st (single-thread) does NOT need SharedArrayBuffer.
      // Keeping these headers blocks cross-origin audio from the Rails backend (COEP require-corp).
    },
    hmr: {
      // Reduce HMR overhead via ngrok
      overlay: false, // Disable error overlay
    },
    fs: {
      // Reduce file system requests
      strict: false,
    },
  },
  optimizeDeps: {
    // Pre-bundle these to avoid dynamic imports via ngrok
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@evoapi/design-system',
      'lucide-react',
      'sonner',
      'zustand',
    ],
    // Force optimization on start
    force: true,
  },
  // Reduce module transformation in dev
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
});
