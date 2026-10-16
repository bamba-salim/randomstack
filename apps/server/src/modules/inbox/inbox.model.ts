import {BaseModel} from '#abstracts'
import type {InboxKind, InboxStatus} from '@randomstack/commons'

export type CreateInboxRow = {
    kind: InboxKind
    subject: string
    body: string
    authorId: string
    technologyId?: string | null
    postId?: string | null
    meta?: unknown
}

export default class InboxModel extends BaseModel {

    static async create(data: CreateInboxRow) {
        return await this.db.inboxMessage.create({
            data: {
                kind: data.kind,
                subject: data.subject,
                body: data.body,
                authorId: data.authorId,
                technologyId: data.technologyId || null,
                postId: data.postId || null,
                meta: data.meta ?? undefined
            },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        profile: {select: {displayName: true}}
                    }
                }
            }
        })
    }

    static async fetchForKinds(kinds: InboxKind[]) {
        if (!kinds.length) return []
        return await this.db.inboxMessage.findMany({
            where: {kind: {in: kinds}},
            orderBy: {createdAt: 'desc'},
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        profile: {select: {displayName: true}}
                    }
                }
            }
        })
    }

    static async fetchById(id: string) {
        return await this.db.inboxMessage.findUnique({
            where: {id},
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        profile: {select: {displayName: true}}
                    }
                }
            }
        })
    }

    /** Messages « nouveaux » = statut OPEN, pour le badge nav */
    static async countOpen(kinds: InboxKind[]) {
        if (!kinds.length) return 0
        return await this.db.inboxMessage.count({
            where: {kind: {in: kinds}, status: 'OPEN'}
        })
    }

    /** Signalements ouverts liés à une techno ou un article */
    static async fetchActiveReports(opts: {
        technologyId?: string
        postId?: string
        kinds: InboxKind[]
    }) {
        const {technologyId, postId, kinds} = opts
        if (!technologyId && !postId) return []
        if (!kinds.length) return []

        return await this.db.inboxMessage.findMany({
            where: {
                kind: {in: kinds},
                status: {in: ['OPEN', 'IN_PROGRESS']},
                ...(technologyId ? {technologyId} : {}),
                ...(postId ? {postId} : {})
            },
            orderBy: {createdAt: 'desc'},
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        profile: {select: {displayName: true}}
                    }
                }
            }
        })
    }

    static async updateStatus(id: string, status: InboxStatus, resolverId: string) {
        const closed = status === 'RESOLVED' || status === 'DISMISSED'
        return await this.db.inboxMessage.update({
            where: {id},
            data: {
                status,
                resolvedById: closed ? resolverId : null,
                resolvedAt: closed ? new Date() : null
            },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        profile: {select: {displayName: true}}
                    }
                }
            }
        })
    }
}
