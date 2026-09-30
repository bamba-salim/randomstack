import PostModel from './post.model'

export default class PostAction {

    private static isOlderThan(date1: Date, date2: Date, maxHours: number): boolean {
        const ageInHours = (new Date(date1).getTime() - new Date(date2).getTime()) / (1000 * 60 * 60)
        return ageInHours > maxHours
    }

    static async resolveFeaturedPostByTag(tag: string) {
        let featured = await PostModel.fetchExplicitFeaturedPostByTag(tag)

        if (featured) {
            const publishDate = featured.publishAt || featured.createdAt
            if (this.isOlderThan(new Date(), publishDate, 48)) featured = null
        }

        if (!featured) featured = await PostModel.fetchLatestPostByTag(tag) // Plan B : le plus récent

        return featured
    }
}