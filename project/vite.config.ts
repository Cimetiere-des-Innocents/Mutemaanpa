import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig((env) => ({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        rollupOptions: {
            input:
                env.mode === 'development'
                    ? {
                          main: resolve(__dirname, 'index.html'),
                          preview: resolve(__dirname, 'preview', 'index.html'),
                      }
                    : undefined,
        },
    },
}));
