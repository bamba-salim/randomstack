import {BaseModel} from '#abstracts'
import type {EditFile} from '@randomstack/commons'

export default class FileModel extends BaseModel {

    static async getFileById(id: string) {
        return await this.db.file.findUnique({where: {id}})
    }

    static async createFile(payload: EditFile) {
        return await this.db.file.create({
            data: payload.file
        })
    }

    static async deleteFile(id: string) {
        await this.db.file.delete({where: {id}})
    }

    static async listAll() {
        return await this.db.file.findMany({
            select: {
                id: true,
                type: true,
                category: true,
                extension: true,
                mimeType: true,
                size: true,
                altText: true,
                createdAt: true
            }
        })
    }

    /** Fichiers plus vieux que `olderThan` (candidats orphelins). */
    static async listOlderThan(olderThan: Date) {
        return await this.db.file.findMany({
            where: {createdAt: {lt: olderThan}},
            select: {
                id: true,
                type: true,
                category: true,
                extension: true,
                mimeType: true,
                size: true,
                altText: true,
                createdAt: true
            }
        })
    }
}
