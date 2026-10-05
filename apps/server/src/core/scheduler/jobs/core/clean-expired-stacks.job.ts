import type { ScheduledJob } from '@randomstack/commons'
// Remarque : pointera vers ton action de nettoyage existante ou future
// import CleanExpiredStacksAction from '#action-support/stack/clean-expired-stacks.action'

export const cleanExpiredStacksJob: ScheduledJob = {
    name: 'Nettoyage des Stacks Expirées (7 jours)',
    schedule: '0 0 * * *', // Tous les jours à minuit
    enabled: true,

    async run() {
        // Appel de l'action de maintenance
        // await CleanExpiredStacksAction.run()
        console.log('[ACTION] Vérification et purge des SavedStacks expirées en BDD...')
    }
}