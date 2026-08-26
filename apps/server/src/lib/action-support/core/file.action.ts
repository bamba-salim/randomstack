import {FileUtils} from '#utils'
import {PostMapper} from '#mappers'
import type {FILE_TYPE, TABLE} from '@randomstack/commons'
import type {FileType} from '@randomstack/commons'

export default class FileAction {
    // Sauvegarde physique et création de l'enregistrement dans la table File 🚀
    static async save(fileBuffer: Buffer, originalName: string, type: FileType, category: string, altText?: string) {
        const ext = require('path').extname(originalName).toLowerCase()

        const targetId = require('crypto').randomUUID()
        const savedPath = FileUtils.saveUpload(fileBuffer, originalName, type, category, targetId)

        if (!savedPath) {
            throw new Error("Échec de la sauvegarde physique du fichier.")
        }

        // TODO: mimeType dynamic
        const _file = FileMapper.toSaveFileDTO(targetId, type, ext, 'image/jpeg', fileBuffer.length, altText)

        return await FileModel.createFile(_file)

    }

    // Reconstitue l'URL publique (Utilisé par les mappers pour le Client) 🚀
    static getUrl(file: { id: string, category: string, type: string, extension: string } | null): string | null {
        if (!file) return null
        return `/public/${file.type.toLowerCase()}/${file.category.toLowerCase()}/${file.category.toLowerCase()}-${file.id}${file.extension}`
    }

    // Suppression physique et logique 🗑️
    static async delete(id: string): Promise<boolean> {
        try {
            const fileRecord = FileModel.getFileById(id)
            if (!fileRecord) return false

            const relativePath = this.getUrl(fileRecord)
            if (relativePath) FileUtils.deleteFile(relativePath)


            await FileModel.deleteFile(id)
            return true
        } catch (error: any) {
            console.error("[FileAction] Erreur lors de la suppression :", error.message || error)
            return false
        }
    }


    static async savePostImage(file) {
        return await FileAction.save(file.buffer, file.originalname, FILE_TYPE.IMAGE, TABLE.POST)
    }
}