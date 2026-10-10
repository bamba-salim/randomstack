import { BaseModel } from '#abstracts'
import type { Category } from '@randomstack/commons'

export interface SaveStackPayload {
    shareCode: string
    projectType: Category
    frontendId: string
    backendId: string
    databaseId: string
    ormId?: string | null
    expiresAt: Date
    createdAt: Date
}

export default class StackModel extends BaseModel {
    static async create(data: SaveStackPayload) {
        return await this.db.savedStack.create({
            data: {
                shareCode: data.shareCode,
                projectType: data.projectType,
                frontendId: data.frontendId,
                backendId: data.backendId,
                databaseId: data.databaseId,
                ormId: data.ormId || null,
                expiresAt: data.expiresAt,
                createdAt: data.createdAt
            }
        })
    }

    static async findByCode(shareCode: string) {
        return await this.db.savedStack.findUnique({
            where: { shareCode }
        })
    }

    /**
     * Utilisé par la tâche cron pour purger les partages de plus de 7 jours
     */
    static async deleteExpiredSharedStack() {
        return await this.db.savedStack.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        })
    }
}