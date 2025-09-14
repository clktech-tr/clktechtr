import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

export default defineConfig({

  plugins: [
    react(),
    runtimeErrorOverlay(),
  ],
  resolve: {
    alias: {
      "@": path.resolve("./src"),
      "@assets": path.resolve("../attached_assets"),
      "@shared": path.resolve("../shared"),
    },
  },
  build: {
    outDir: path.resolve("../dist/public"),
    emptyOutDir: true,
  }
});