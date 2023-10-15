import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

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
                          main: fileURLToPath(new URL('./index.html', import.meta.url)),
                          preview: fileURLToPath(new URL('./preview/index.html', import.meta.url)),
                      }
                    : undefined,
        },
    },
}));
