import {BaseModel} from '#abstracts'

export default class FavoriteModel extends BaseModel {

    static async isFavorite(userId: string, postId: string): Promise<boolean> {
        const row = await this.db.postFavorite.findUnique({
            where: {userId_postId: {userId, postId}},
            select: {id: true}
        })
        return Boolean(row)
    }

    static async toggle(userId: string, postId: string): Promise<boolean> {
        const existing = await this.db.postFavorite.findUnique({
            where: {userId_postId: {userId, postId}},
            select: {id: true}
        })

        if (existing) {
            await this.db.postFavorite.delete({where: {id: existing.id}})
            return false
        }

        await this.db.postFavorite.create({
            data: {userId, postId}
        })
        return true
    }

    static async fetchUserFavorites(userId: string) {
        return await this.db.postFavorite.findMany({
            where: {
                userId,
                post: {status: 'PUBLISHED'}
            },
            orderBy: {createdAt: 'desc'},
            include: {
                post: true
            }
        })
    }

    static async postExistsPublished(postId: string): Promise<boolean> {
        const post = await this.db.post.findFirst({
            where: {id: postId, status: 'PUBLISHED'},
            select: {id: true}
        })
        return Boolean(post)
    }
}
