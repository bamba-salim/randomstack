import './load-env.js'

import {Database} from '#db'
import {initScheduler, stopScheduler} from '#scheduler'

async function bootstrapWorker() {
    console.log('==================================================')
    console.log('🚀 [RANDOMSTACK WORKER] Démarrage du Background Runner')
    console.log('==================================================')

    try {
        const connected = await Database.checkConnection()
        if (!connected) {
            console.error('[WORKER] Impossible de se connecter à PostgreSQL.')
            process.exit(1)
        }

        initScheduler()
        console.log('[WORKER] En attente des déclenchements programmés...')
    } catch (error) {
        console.error('[WORKER CRITICAL] Échec du démarrage du worker :', error)
        process.exit(1)
    }
}

const handleShutdown = async (signal: string) => {
    console.log(`\n[WORKER] Signal ${signal} reçu. Arrêt gracieux en cours...`)
    stopScheduler()
    console.log('[WORKER] Arrêt complet.')
    process.exit(0)
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'))
process.on('SIGINT', () => handleShutdown('SIGINT'))

void bootstrapWorker()
