import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const backendUrl = process.env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:8000';

export default defineConfig({
  build: {
    sourcemap: true,
  },
  server: {
    port: 4200,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      shared: path.resolve(__dirname, './src/shared'),
      modules: path.resolve(__dirname, './src/modules'),
      widgets: path.resolve(__dirname, './src/widgets'),
      app: path.resolve(__dirname, './src/app'),
      src: path.resolve(__dirname, './src'),
    },
  },
});
