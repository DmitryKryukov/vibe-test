import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'src',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@fonts': path.resolve(__dirname, './src/assets/fonts'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },

  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});