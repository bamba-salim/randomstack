import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '#services': fileURLToPath(new URL('./src/services/index.ts', import.meta.url)),
            '#pages': fileURLToPath(new URL('./src/pages/index.ts', import.meta.url))
        }
    }
})