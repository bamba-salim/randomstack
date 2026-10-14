import {FileAction} from '#file'
import BlogModel from './blog.model'

const PURGE_AFTER_DAYS = 90
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Hard-delete des posts soft-deleted depuis plus de 90 jours (+ fichiers liés). */
export default class PurgeDeletedPostsAction {
    static async run(): Promise<{purged: number}> {
        const cutoff = new Date(Date.now() - PURGE_AFTER_DAYS * 24 * 60 * 60 * 1000)
        const expired = await BlogModel.fetchExpiredSoftDeleted(cutoff)
        let purged = 0

        for (const post of expired) {
            const fileIds = new Set<string>()
            if (post.imageId) fileIds.add(post.imageId)
            this.collectImageIds(post.content, fileIds)

            for (const fileId of fileIds) {
                await FileAction.delete(fileId).catch(() => undefined)
            }

            await BlogModel.hardDeletePost(post.id)
            purged += 1
        }

        return {purged}
    }

    private static collectImageIds(content: unknown, ids: Set<string>): void {
        if (!Array.isArray(content)) return
        for (const block of content) {
            this.walkBlock(block, ids)
        }
    }

    private static walkBlock(block: unknown, ids: Set<string>): void {
        if (!block || typeof block !== 'object') return
        const b = block as Record<string, unknown>
        if (
            (b['type'] === 'IMAGE' || b['type'] === 'VIDEO')
            && typeof b['value'] === 'string'
            && UUID_RE.test(b['value'])
        ) {
            ids.add(b['value'])
        }
        if (b['left']) this.walkBlock(b['left'], ids)
        if (b['right']) this.walkBlock(b['right'], ids)
    }
}
