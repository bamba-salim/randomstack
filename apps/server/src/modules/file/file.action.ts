import crypto from 'crypto'
import path from 'path'

import {FILE_TYPE, TABLE, type FileType, type FileRecord} from '@randomstack/commons'

import FileModel from './file.model.js'
import FileUtils from './file.utils.js'
import FileMapper from './file.mapper.js'
import ObjectStorage from './object-storage.js'

export default class FileAction {
    static async save(
        fileBuffer: Buffer,
        originalName: string,
        type: FileType,
        category: string,
        altText?: string,
        mimeType?: string
    ) {
        const ext = path.extname(originalName).toLowerCase() || '.bin'
        const targetId = crypto.randomUUID()
        const objectKey = FileUtils.buildObjectKey(category, type, targetId, ext)
        const resolvedMime = mimeType || 'application/octet-stream'

        if (ObjectStorage.isEnabled()) {
            await ObjectStorage.putObject(objectKey, fileBuffer, resolvedMime)
        } else {
            const saved = FileUtils.saveUploadLocal(fileBuffer, objectKey)
            if (!saved) {
                throw new Error('Échec de la sauvegarde physique du fichier.')
            }
        }

        const _file = FileMapper.toSaveFileDTO(
            targetId,
            type,
            category as any,
            ext,
            resolvedMime,
            fileBuffer.length,
            altText ? altText : null
        )

        return await FileModel.createFile(_file)
    }

    /** URL stable API (`/files/:id`) pour les réponses JSON. */
    static getUrl(file: FileRecord): string {
        return FileUtils.getPublicApiPath(file.id)
    }

    static async getSignedOrLocalPath(id: string): Promise<
        | {kind: 'redirect'; url: string}
        | {kind: 'local'; absolutePath: string; mimeType: string}
        | null
    > {
        const file = await FileModel.getFileById(id)
        if (!file) return null

        const objectKey = FileUtils.buildObjectKeyFromFile(file as FileRecord)

        if (ObjectStorage.isEnabled()) {
            const exists = await ObjectStorage.exists(objectKey)
            if (!exists) return null
            const url = await ObjectStorage.getSignedGetUrl(objectKey, 3600)
            return {kind: 'redirect', url}
        }

        const absolutePath = FileUtils.resolveLocalAbsolutePath(objectKey)
        return {
            kind: 'local',
            absolutePath,
            mimeType: file.mimeType || 'application/octet-stream'
        }
    }

    static async delete(id: string): Promise<boolean> {
        try {
            const fileRecord = await FileModel.getFileById(id)
            if (!fileRecord) return false

            const objectKey = FileUtils.buildObjectKeyFromFile(fileRecord as FileRecord)

            if (ObjectStorage.isEnabled()) {
                await ObjectStorage.deleteObject(objectKey)
            } else {
                FileUtils.deleteLocal(objectKey)
            }

            await FileModel.deleteFile(id)
            return true
        } catch (error: any) {
            console.error('[FileAction] Erreur lors de la suppression :', error.message || error)
            return false
        }
    }

    static async savePostImage(file: {buffer: Buffer; originalname: string; mimetype?: string}) {
        return await FileAction.save(
            file.buffer,
            file.originalname,
            FILE_TYPE.IMAGE,
            TABLE.POST,
            undefined,
            file.mimetype
        )
    }
}
