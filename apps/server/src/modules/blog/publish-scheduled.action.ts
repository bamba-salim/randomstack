import BlogModel from './blog.model'

/** Passe SCHEDULED → PUBLISHED quand publishAt est atteint. */
export default class PublishScheduledAction {
    static async run(): Promise<{published: number}> {
        const result = await BlogModel.publishDueScheduled()
        return {published: result.count}
    }
}
