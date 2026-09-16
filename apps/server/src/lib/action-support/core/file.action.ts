import crypto from 'crypto'
import path from 'path'

import {FileModel} from '#models'
import {FileUtils} from '#utils'
import {PostMapper, FileMapper} from '#mappers'
import type {FILE_TYPE, TABLE, FileType, File} from '@randomstack/commons'

export default class FileAction {
    // Sauvegarde physique et création de l'enregistrement dans la table File 🚀
    static async save(fileBuffer: Buffer, originalName: string, type: FileType, category: string, altText?: string) {
        const ext = path.extname(originalName).toLowerCase()

        const targetId = crypto.randomUUID()

        const savedPath = FileUtils.saveUpload(fileBuffer, originalName, category, type, targetId)

        if (!savedPath) {
            throw new Error("Échec de la sauvegarde physique du fichier.")
        }


        // TODO: mimeType dynamic
        const _file = FileMapper.toSaveFileDTO(targetId, type, category, ext, 'image/jpeg', fileBuffer.length, !!altText ? altText : null)

        return await FileModel.createFile(_file)

    }

    // Reconstitue l'URL publique (Utilisé par les mappers pour le Client) 🚀
    static getUrl(file: File): string | null {
        const uri = FileUtils.getFileUrl(file)
        return uri
    }

    static async getUrlByID(id: string): string | null {

        const file= await FileModel.getFileById(id)

        const uri = FileUtils.getFileUrl(file)
        return uri

    }

    // Suppression physique et logique 🗑️
    static async delete(id: string): Promise<boolean> {
        try {
            const fileRecord = await FileModel.getFileById(id)
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