import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: import.meta.dirname,
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@refore/copy-to-design-sdk': path.join(import.meta.dirname, '../../src/index.ts'),
      '@/': path.join(import.meta.dirname, './src/'),
    },
  },
});
