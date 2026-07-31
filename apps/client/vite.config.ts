import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '#services': fileURLToPath(new URL('./src/lib/services/index.ts', import.meta.url)),
            '#scripts': fileURLToPath(new URL('./src/lib/scripts/index.ts', import.meta.url)),
            '#pages': fileURLToPath(new URL('./src/pages/index.ts', import.meta.url)),
        }
    },
    // AJOUTEZ CE BLOC SERVEUR ICI 🚀
    server: {
        watch: {
            usePolling: true // Force le "watch" par scrutation pour fonctionner sous Docker sur Mac
        }
    }
})