import type {ScheduledJob} from '@randomstack/commons'
import {CleanOrphanFilesAction} from '#file'

export const cleanOrphanFilesJob: ScheduledJob = {
    name: 'Nettoyage fichiers orphelins (30 jours) + migration naming',
    schedule: '15 0 * * *',
    enabled: true,

    async run() {
        const result = await CleanOrphanFilesAction.run()
        console.log(
            `[ACTION] refs=${result.referenced} · orphelins supprimés=${result.deleted} · renommés=${result.migrated} · inchangés=${result.skippedMigrate}`
        )
    }
}
