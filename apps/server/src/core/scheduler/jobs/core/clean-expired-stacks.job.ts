import type {ScheduledJob} from '@randomstack/commons'
import {CleanExpiredSharesAction} from '#stack'

export const cleanExpiredStacksJob: ScheduledJob = {
    name: 'Nettoyage des partages stack expirés (7 jours)',
    schedule: '0 0 * * *',
    enabled: true,

    async run() {
        const {deleted} = await CleanExpiredSharesAction.run()
        console.log(`[ACTION] ${deleted} lien(s) de partage stack purgé(s).`)
    }
}
