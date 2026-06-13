import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2023',
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // Externalise all @nuxt/ui entry points — they rely on Nuxt's virtual `#imports`
      // which only exists inside a Nuxt build. Consumers (apps/web) resolve them natively.
      external: ['vue', /^@nuxt\/ui(\/.*)?$/],
    },
  },
});
