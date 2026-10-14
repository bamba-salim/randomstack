import fs from 'fs'
import path from 'path'
import type {FileRecord} from '@randomstack/commons'

export default class FileUtils {
    /** Ne garde que [A-Z0-9_-] pour bloquer `../` dans category/type. */
    private static safeSegment(value: string): string {
        const cleaned = String(value || '')
            .toUpperCase()
            .replace(/[^A-Z0-9_-]/g, '')
        if (!cleaned) {
            throw new Error('Segment de chemin fichier invalide.')
        }
        return cleaned
    }

    private static safeId(id: string): string {
        const safeId = String(id || '').replace(/[^a-zA-Z0-9_-]/g, '')
        if (!safeId) {
            throw new Error('Identifiant fichier invalide.')
        }
        return safeId
    }

    private static safeExt(extension: string): string {
        const extRaw = extension.startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`
        return extRaw.replace(/[^a-z0-9.]/g, '') || '.bin'
    }

    /**
     * Clé objet actuelle : uploads/{CATEGORY}/{TYPE}/{id}{ext}
     * (anciennement `{CATEGORY}-{id}{ext}`)
     */
    static buildObjectKey(category: string, type: string, id: string, extension: string): string {
        const cat = this.safeSegment(category)
        const typ = this.safeSegment(type)
        const safeId = this.safeId(id)
        const ext = this.safeExt(extension)
        return `uploads/${cat}/${typ}/${safeId}${ext}`
    }

    /** Ancien format : uploads/{CATEGORY}/{TYPE}/{CATEGORY}-{id}{ext} */
    static buildLegacyObjectKey(category: string, type: string, id: string, extension: string): string {
        const cat = this.safeSegment(category)
        const typ = this.safeSegment(type)
        const safeId = this.safeId(id)
        const ext = this.safeExt(extension)
        return `uploads/${cat}/${typ}/${cat}-${safeId}${ext}`
    }

    static buildObjectKeyFromFile(file: FileRecord): string {
        return this.buildObjectKey(String(file.category), String(file.type), file.id, file.extension)
    }

    static buildLegacyObjectKeyFromFile(file: FileRecord): string {
        return this.buildLegacyObjectKey(String(file.category), String(file.type), file.id, file.extension)
    }

    /** URL stable exposée aux fronts (gate API, pas l’URL bucket). */
    static getPublicApiPath(fileId: string): string {
        return `/files/${fileId}`
    }

    static readJSON<T>(relativeFilePath: string): T | null {
        try {
            const fullPath = path.resolve(process.cwd(), relativeFilePath)
            if (!fs.existsSync(fullPath)) return null

            const rawData = fs.readFileSync(fullPath, 'utf-8')
            return JSON.parse(rawData) as T
        } catch (error: any) {
            console.error(`[FileUtils] Erreur de lecture du JSON (${relativeFilePath}) :`, error.message || error)
            return null
        }
    }

    static writeJSON(relativeFilePath: string, data: any): boolean {
        try {
            const fullPath = path.resolve(process.cwd(), relativeFilePath)
            fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8')
            return true
        } catch (error: any) {
            console.error(`[FileUtils] Erreur d'écriture du JSON (${relativeFilePath}) :`, error.message || error)
            return false
        }
    }

    /** Fallback local quand S3_* n’est pas configuré. */
    static saveUploadLocal(fileBuffer: Buffer, objectKey: string): string | null {
        try {
            const absolutePath = this.resolveLocalAbsolutePath(objectKey)
            const dir = path.dirname(absolutePath)

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {recursive: true})
            }

            fs.writeFileSync(absolutePath, fileBuffer)
            return `/public/${objectKey}`
        } catch (error: any) {
            console.error('[FileUtils] Échec sauvegarde locale :', error.message || error)
            return null
        }
    }

    static resolveLocalAbsolutePath(objectKey: string): string {
        const root = path.resolve(process.cwd(), 'public')
        const absolutePath = path.resolve(root, objectKey)
        if (!absolutePath.startsWith(root + path.sep) && absolutePath !== root) {
            throw new Error('Chemin fichier hors zone autorisée.')
        }
        return absolutePath
    }

    static localExists(objectKey: string): boolean {
        try {
            return fs.existsSync(this.resolveLocalAbsolutePath(objectKey))
        } catch {
            return false
        }
    }

    /** Renomme un fichier local (legacy → nouveau naming). */
    static renameLocal(fromKey: string, toKey: string): boolean {
        try {
            const from = this.resolveLocalAbsolutePath(fromKey)
            const to = this.resolveLocalAbsolutePath(toKey)
            if (!fs.existsSync(from)) return false
            if (fs.existsSync(to)) {
                fs.unlinkSync(from)
                return true
            }
            const dir = path.dirname(to)
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {recursive: true})
            }
            fs.renameSync(from, to)
            return true
        } catch (error: any) {
            console.error('[FileUtils] Échec rename local :', error.message || error)
            return false
        }
    }

    static deleteLocal(objectKey: string): boolean {
        try {
            const fullPath = this.resolveLocalAbsolutePath(objectKey)
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath)
                return true
            }
            return false
        } catch (error: any) {
            console.error('[FileUtils] Échec suppression locale :', error.message || error)
            return false
        }
    }
}
