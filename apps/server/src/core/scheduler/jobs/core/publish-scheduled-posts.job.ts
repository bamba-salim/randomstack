import type {ScheduledJob} from '@randomstack/commons'
import PublishScheduledAction from '../../../../modules/blog/publish-scheduled.action'
// Note: action locale au module blog (pas encore d’alias #blog pour les actions)

export const publishScheduledPostsJob: ScheduledJob = {
    name: 'Publication des articles planifiés',
    schedule: '*/5 * * * *',
    enabled: true,

    async run() {
        const {published} = await PublishScheduledAction.run()
        if (published > 0) {
            console.log(`[ACTION] ${published} article(s) planifié(s) publié(s).`)
        }
    }
}
