import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '#services': fileURLToPath(new URL('./src/services/index.ts', import.meta.url)),
            '#pages': fileURLToPath(new URL('./src/pages/index.ts', import.meta.url)),
            '#interfaces': fileURLToPath(new URL('./src/lib/interfaces/index.ts', import.meta.url)),
            '#components': fileURLToPath(new URL('./src/lib/components/index.ts', import.meta.url)),
            '#scripts': fileURLToPath(new URL('./src/lib/scripts/index.ts', import.meta.url)),
            '#utils': fileURLToPath(new URL('./src/lib/utils/index.ts', import.meta.url))
        }
    },
    server: {
        port: 5175,
        watch: {
            usePolling: true
        }
    },
    // AJOUTEZ CE BLOC CSS POUR SASS MODERNE 🚀
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler'
            }
        }
    }
})