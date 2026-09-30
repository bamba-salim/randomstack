import {BaseModel} from "#abstracts"

export default class PostModel extends BaseModel {

    static async fetchExplicitFeaturedPostByTag(tag: string) {
        return await this.db.post.findFirst({
            where: {status: 'PUBLISHED', isFeatured: true, tags: {has: tag}},
            orderBy: {publishAt: 'desc'}
        })
    }

    static async fetchLatestPostByTag(tag: string) {
        return await this.db.post.findFirst({
            where: {status: 'PUBLISHED', tags: {has: tag}},
            orderBy: {publishAt: 'desc'}
        })
    }

    static async fetchPublishedPostsByTag(tag: string, excludeId?: string) {
        return await this.db.post.findMany({
            where: {
                status: 'PUBLISHED',
                tags: {has: tag},
                id: excludeId ? {not: excludeId} : undefined
            },
            orderBy: {publishAt: 'desc'}
        })
    }
}