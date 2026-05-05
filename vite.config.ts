import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFile, mkdir } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import type { Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// opus-recorder ships a single self-contained worker file (encoderWorker.min.js)
// that bundles libopusenc as inline base64 WASM — no separate .wasm to fetch,
// no SharedArrayBuffer needed. We self-host it so the SPA does not depend on
// unpkg.com (CORS-blocked + unreliable).
//
// useAudioRecorder.ts captures mic PCM via Web Audio and pipes it through this
// worker, which produces OGG/Opus PTT-compliant bytes (48kHz, mono, 16kbps,
// application=VOIP) that WhatsApp Cloud accepts directly — no post-conversion.
const OPUS_RECORDER_DIR = path.resolve(__dirname, 'node_modules/opus-recorder/dist');
const OPUS_RECORDER_FILES = ['encoderWorker.min.js'];

function opusRecorderPlugin(): Plugin {
  return {
    name: 'opus-recorder-self-host',
    configureServer(server) {
      // Serve /opus-recorder/<file> from node_modules during dev.
      server.middlewares.use('/opus-recorder', (req, res, next) => {
        const file = (req.url || '/').replace(/^\/+/, '').split('?')[0];
        if (!OPUS_RECORDER_FILES.includes(file)) return next();
        const filePath = path.join(OPUS_RECORDER_DIR, file);
        if (!existsSync(filePath)) return next();
        res.setHeader('Content-Type', 'text/javascript');
        res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
        createReadStream(filePath).pipe(res);
      });
    },
    async writeBundle(options) {
      const outDir = options.dir ?? path.resolve(__dirname, 'dist');
      const dest = path.join(outDir, 'opus-recorder');
      await mkdir(dest, { recursive: true });
      await Promise.all(
        OPUS_RECORDER_FILES.map(file =>
          copyFile(path.join(OPUS_RECORDER_DIR, file), path.join(dest, file)),
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
    opusRecorderPlugin(),
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
