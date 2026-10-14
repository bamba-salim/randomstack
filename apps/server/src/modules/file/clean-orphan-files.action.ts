import {BaseModel} from '#abstracts'
import FileAction from './file.action'
import FileModel from './file.model'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const ORPHAN_MAX_AGE_DAYS = 30

/**
 * Purge les fichiers non référencés après 30 jours.
 * Scanne posts (cover + blocs content), profils, logos techno.
 * Migre aussi le naming legacy → `{id}{ext}`.
 */
export default class CleanOrphanFilesAction extends BaseModel {

    static async run(): Promise<{
        referenced: number
        deleted: number
        migrated: number
        skippedMigrate: number
    }> {
        const referenced = await this.collectReferencedFileIds()
        const cutoff = new Date(Date.now() - ORPHAN_MAX_AGE_DAYS * 24 * 60 * 60 * 1000)
        const candidates = await FileModel.listOlderThan(cutoff)

        let deleted = 0
        for (const file of candidates) {
            if (referenced.has(file.id)) continue
            const ok = await FileAction.delete(file.id)
            if (ok) deleted += 1
        }

        const {migrated, skipped} = await FileAction.migrateLegacyNaming()

        return {
            referenced: referenced.size,
            deleted,
            migrated,
            skippedMigrate: skipped
        }
    }

    private static async collectReferencedFileIds(): Promise<Set<string>> {
        const ids = new Set<string>()

        const posts = await this.db.post.findMany({
            select: {imageId: true, content: true}
        })
        for (const post of posts) {
            if (post.imageId) ids.add(post.imageId)
            this.collectFromContent(post.content, ids)
        }

        const profiles = await this.db.userProfile.findMany({
            where: {photoId: {not: null}},
            select: {photoId: true}
        })
        for (const profile of profiles) {
            if (profile.photoId) ids.add(profile.photoId)
        }

        const techs = await this.db.technology.findMany({
            where: {logo: {not: null}},
            select: {logo: true}
        })
        for (const tech of techs) {
            if (tech.logo && UUID_RE.test(tech.logo)) {
                ids.add(tech.logo)
            }
        }

        return ids
    }

    private static collectFromContent(content: unknown, ids: Set<string>): void {
        if (!content) return
        if (Array.isArray(content)) {
            for (const block of content) {
                this.collectFromBlock(block, ids)
            }
            return
        }
        this.collectFromBlock(content, ids)
    }

    private static collectFromBlock(block: unknown, ids: Set<string>): void {
        if (!block || typeof block !== 'object') return
        const b = block as Record<string, unknown>

        if (
            (b['type'] === 'IMAGE' || b['type'] === 'VIDEO')
            && typeof b['value'] === 'string'
            && UUID_RE.test(b['value'])
        ) {
            ids.add(b['value'])
        }

        if (b['left']) this.collectFromBlock(b['left'], ids)
        if (b['right']) this.collectFromBlock(b['right'], ids)
    }
}
