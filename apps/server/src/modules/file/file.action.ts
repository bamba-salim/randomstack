import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

import {FILE_TYPE, TABLE, type FileType, type FileRecord} from '@randomstack/commons'

import FileModel from './file.model.js'
import FileUtils from './file.utils.js'
import FileMapper from './file.mapper.js'
import ObjectStorage from './object-storage.js'
import ImageCompress from './image-compress.js'

export default class FileAction {
    static async save(
        fileBuffer: Buffer,
        originalName: string,
        type: FileType,
        category: string,
        altText?: string,
        mimeType?: string
    ) {
        let buffer = fileBuffer
        let name = originalName
        let resolvedMime = mimeType || 'application/octet-stream'
        let ext = path.extname(originalName).toLowerCase() || '.bin'

        if (type === FILE_TYPE.IMAGE || resolvedMime.startsWith('image/')) {
            const compressed = await ImageCompress.maybeCompress(buffer, name, resolvedMime)
            buffer = compressed.buffer
            name = compressed.originalName
            resolvedMime = compressed.mimeType
            ext = compressed.extension
            if (compressed.compressed) {
                const pct = Math.round((1 - compressed.bytesAfter / compressed.bytesBefore) * 100)
                console.log(
                    `[FileAction] Image compressée WebP q90 : ${compressed.bytesBefore} → ${compressed.bytesAfter} octets (−${pct}%)`
                )
            }
        }

        const targetId = crypto.randomUUID()
        const objectKey = FileUtils.buildObjectKey(category, type, targetId, ext)

        if (ObjectStorage.isEnabled()) {
            await ObjectStorage.putObject(objectKey, buffer, resolvedMime)
        } else {
            const saved = FileUtils.saveUploadLocal(buffer, objectKey)
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
            buffer.length,
            altText ? altText : null
        )

        return await FileModel.createFile(_file)
    }

    /** URL stable API (`/files/:id`) pour les réponses JSON. */
    static getUrl(file: FileRecord): string {
        return FileUtils.getPublicApiPath(file.id)
    }

    /**
     * Résout la clé stockage (nouveau naming, sinon legacy).
     * Migre silencieusement legacy → `{id}{ext}` si trouvé.
     */
    static async resolveStorageKey(file: FileRecord): Promise<string | null> {
        const modern = FileUtils.buildObjectKeyFromFile(file)
        const legacy = FileUtils.buildLegacyObjectKeyFromFile(file)

        if (ObjectStorage.isEnabled()) {
            if (await ObjectStorage.exists(modern)) return modern
            if (await ObjectStorage.exists(legacy)) {
                const moved = await ObjectStorage.moveObject(legacy, modern)
                return moved ? modern : legacy
            }
            return null
        }

        if (FileUtils.localExists(modern)) return modern
        if (FileUtils.localExists(legacy)) {
            FileUtils.renameLocal(legacy, modern)
            return FileUtils.localExists(modern) ? modern : legacy
        }
        return null
    }

    static async getSignedOrLocalPath(id: string): Promise<
        | {kind: 'redirect'; url: string}
        | {kind: 'local'; absolutePath: string; mimeType: string}
        | null
    > {
        const file = await FileModel.getFileById(id)
        if (!file) return null

        const objectKey = await FileAction.resolveStorageKey(file as FileRecord)
        if (!objectKey) return null

        if (ObjectStorage.isEnabled()) {
            const url = await ObjectStorage.getSignedGetUrl(objectKey, 3600)
            return {kind: 'redirect', url}
        }

        const absolutePath = FileUtils.resolveLocalAbsolutePath(objectKey)
        if (!fs.existsSync(absolutePath)) return null

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

            const file = fileRecord as FileRecord
            const modern = FileUtils.buildObjectKeyFromFile(file)
            const legacy = FileUtils.buildLegacyObjectKeyFromFile(file)

            if (ObjectStorage.isEnabled()) {
                await ObjectStorage.deleteObject(modern).catch(() => undefined)
                await ObjectStorage.deleteObject(legacy).catch(() => undefined)
            } else {
                FileUtils.deleteLocal(modern)
                FileUtils.deleteLocal(legacy)
            }

            await FileModel.deleteFile(id)
            return true
        } catch (error: any) {
            console.error('[FileAction] Erreur lors de la suppression :', error.message || error)
            return false
        }
    }

    /** Migre tous les fichiers encore au naming legacy vers `{id}{ext}`. */
    static async migrateLegacyNaming(): Promise<{migrated: number; skipped: number}> {
        const files = await FileModel.listAll()
        let migrated = 0
        let skipped = 0

        for (const row of files) {
            const file = row as FileRecord
            const modern = FileUtils.buildObjectKeyFromFile(file)
            const legacy = FileUtils.buildLegacyObjectKeyFromFile(file)

            if (ObjectStorage.isEnabled()) {
                const hasModern = await ObjectStorage.exists(modern)
                if (hasModern) {
                    skipped += 1
                    continue
                }
                const hasLegacy = await ObjectStorage.exists(legacy)
                if (!hasLegacy) {
                    skipped += 1
                    continue
                }
                if (await ObjectStorage.moveObject(legacy, modern)) migrated += 1
                else skipped += 1
                continue
            }

            if (FileUtils.localExists(modern)) {
                skipped += 1
                continue
            }
            if (!FileUtils.localExists(legacy)) {
                skipped += 1
                continue
            }
            if (FileUtils.renameLocal(legacy, modern)) migrated += 1
            else skipped += 1
        }

        return {migrated, skipped}
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
