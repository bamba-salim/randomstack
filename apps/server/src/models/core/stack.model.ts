import {Database} from "#db";

export default class StackModel {
    static async create(data: SaveStackDTO) {
        return await Database.client.savedStack.create({
            data: {
                shareCode: data.shareCode,
                projectType: data.projectType as any,
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
        return await Database.client.savedStack.findUnique({
            where: { shareCode }
        })
    }
    static async deleteExpiredSharedStack(){
        return await Database.client.savedStack.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        })
    }
}