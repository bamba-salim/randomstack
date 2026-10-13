import {BaseModel} from '#abstracts'

type VoteType = 'LIKE' | 'DISLIKE'

export default class CommentModel extends BaseModel {

    static async fetchByPostId(postId: string) {
        return await this.db.comment.findMany({
            where: {postId},
            orderBy: {createdAt: 'desc'},
            include: {
                user: {
                    select: {
                        id: true,
                        profile: {
                            select: {
                                displayName: true,
                                photoId: true
                            }
                        }
                    }
                },
                votes: {
                    select: {
                        type: true,
                        userId: true
                    }
                }
            }
        })
    }

    static async fetchById(id: string) {
        return await this.db.comment.findUnique({
            where: {id},
            include: {
                user: {
                    select: {
                        id: true,
                        profile: {
                            select: {
                                displayName: true,
                                photoId: true
                            }
                        }
                    }
                },
                votes: {
                    select: {
                        type: true,
                        userId: true
                    }
                }
            }
        })
    }

    static async create(postId: string, userId: string, content: string) {
        return await this.db.comment.create({
            data: {postId, userId, content},
            include: {
                user: {
                    select: {
                        id: true,
                        profile: {
                            select: {
                                displayName: true,
                                photoId: true
                            }
                        }
                    }
                },
                votes: {
                    select: {
                        type: true,
                        userId: true
                    }
                }
            }
        })
    }

    static async delete(id: string) {
        return await this.db.comment.delete({where: {id}})
    }

    static async countByPostId(postId: string) {
        return await this.db.comment.count({where: {postId}})
    }

    static async findVote(commentId: string, userId: string) {
        return await this.db.commentVote.findUnique({
            where: {commentId_userId: {commentId, userId}}
        })
    }

    static async upsertVote(commentId: string, userId: string, type: VoteType) {
        return await this.db.commentVote.upsert({
            where: {commentId_userId: {commentId, userId}},
            create: {commentId, userId, type},
            update: {type}
        })
    }

    static async deleteVote(commentId: string, userId: string) {
        return await this.db.commentVote.deleteMany({
            where: {commentId, userId}
        })
    }

    static async postExistsPublished(postId: string) {
        const post = await this.db.post.findFirst({
            where: {id: postId, status: 'PUBLISHED'},
            select: {id: true}
        })
        return Boolean(post)
    }
}
