import fs from 'fs'
import path from 'path'
import type {FileRecord} from '@randomstack/commons'

export default class FileUtils {
    /** Clé objet S3 / chemin relatif disque : uploads/{CATEGORY}/{TYPE}/{CATEGORY}-{id}{ext} */
    static buildObjectKey(category: string, type: string, id: string, extension: string): string {
        const cat = category.toUpperCase()
        const typ = type.toUpperCase()
        const ext = extension.startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`
        return `uploads/${cat}/${typ}/${cat}-${id}${ext}`
    }

    static buildObjectKeyFromFile(file: FileRecord): string {
        return this.buildObjectKey(String(file.category), String(file.type), file.id, file.extension)
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
            const absolutePath = path.resolve(process.cwd(), 'public', objectKey)
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
        return path.resolve(process.cwd(), 'public', objectKey)
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
