import fs from 'fs'
import path from 'path'
import type {File} from '@randomstack/commons'

export default class FileUtils {
    // 1. Lecture générique et sécurisée de fichiers JSON (typée) 🚀
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

    // 2. Écriture générique de fichiers JSON 🚀
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

    // 3. Sauvegarde d'images / fichiers téléversés (Prêt pour la V2) 🚀
    // Ajout du paramètre "prefix" pour rendre le nommage totalement générique par table 🚀
    static saveUpload(fileBuffer: Buffer, originalName: string, _category: string, _type: string, itemId: string): string | null {
        try {
            const category = _category.toUpperCase()
            const type = _type.toUpperCase()
            const uploadDir = path.resolve(process.cwd(), 'public', 'uploads', category, type)

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, {recursive: true})
            }

            // Nommage dynamique : {table}-{id}.{extension} (ex: technology-uuid.png) 🚀
            const ext = path.extname(originalName).toLowerCase()
            const uniqueName = `${category}-${itemId}${ext}`
            const finalPath = path.join(uploadDir, uniqueName)

            fs.writeFileSync(finalPath, fileBuffer)

            const uri = `/public/uploads/${category}/${type}/${uniqueName}`
            console.log('utils upload',uri)
            return uri
        } catch (error: any) {
            console.error("[FileUtils] Échec de la sauvegarde physique du fichier :", error.message || error)
            return null
        }
    }

    static getFileUrl(file: File): string | null {
        if (!file) return null

        console.log('file', file)

        const uri = `/public/uploads/${file.category}/${file.type}/${file.category}-${file.id}${file.extension}`
        console.log('utils get url', uri)
        return uri
    }

    // 4. Suppression physique d'un fichier 🗑️
    static deleteFile(relativeFilePath: string): boolean {
        try {
            // Nettoyage du chemin (enlève le slash initial si présent)
            const cleanedPath = relativeFilePath.replace(/^\//, '')
            const fullPath = path.resolve(process.cwd(), cleanedPath)

            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath)
                console.log(`[FileUtils] 🗑️ Fichier supprimé du disque : ${fullPath}`)
                return true
            }
            return false
        } catch (error: any) {
            console.error(`[FileUtils] Échec de la suppression physique du fichier (${relativeFilePath}) :`, error.message || error)
            return false
        }
    }
}