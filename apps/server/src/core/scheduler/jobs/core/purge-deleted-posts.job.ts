import type {ScheduledJob} from '@randomstack/commons'
import {PurgeDeletedPostsAction} from '#blog'

export const purgeDeletedPostsJob: ScheduledJob = {
    name: 'Purge corbeille articles (90 jours)',
    schedule: '30 0 * * *',
    enabled: true,

    async run() {
        const {purged} = await PurgeDeletedPostsAction.run()
        console.log(`[ACTION] ${purged} article(s) définitivement purgé(s).`)
    }
}
