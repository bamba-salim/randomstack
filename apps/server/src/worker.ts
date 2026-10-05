import { initScheduler, stopScheduler } from '#scheduler'
// Import de ton instance Prisma existante (ex: '#db' ou './lib/db')
// import prisma from '#db'

async function bootstrapWorker() {
    console.log('==================================================')
    console.log('🚀 [RANDOMSTACK WORKER] Démarrage du Background Runner')
    console.log('==================================================')

    try {
        // 1. Initialiser le planificateur de tâches
        initScheduler()

        console.log('[WORKER] En attente des déclenchements programmés...')
    } catch (error) {
        console.error('[WORKER CRITICAL] Échec du démarrage du worker :', error)
        process.exit(1)
    }
}

// --- GESTION DE L'ARRÊT GRACIEUX (DOCKER STOP / SIGTERM) ---
const handleShutdown = async (signal: string) => {
    console.log(`\n[WORKER] Signal ${signal} reçu. Arrêt gracieux en cours...`)
    stopScheduler()
    // await prisma.$disconnect()
    console.log('[WORKER] Arrêt complet.')
    process.exit(0)
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'))
process.on('SIGINT', () => handleShutdown('SIGINT'))

bootstrapWorker()