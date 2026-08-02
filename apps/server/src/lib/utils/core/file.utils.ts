import fs from 'fs'
import path from 'path'

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
    static saveUpload(fileBuffer: Buffer, originalName: string, subFolder: string = 'uploads'): string | null {
        try {
            const uploadDir = path.resolve(process.cwd(), 'public', subFolder)

            // S'assurer que le dossier public d'upload existe
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true })
            }

            // Génération d'un nom de fichier unique avec timestamp pour éviter les collisions
            const ext = path.extname(originalName)
            const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
            const finalPath = path.join(uploadDir, uniqueName)

            fs.writeFileSync(finalPath, fileBuffer)

            // On renvoie l'URL relative d'accès public à enregistrer en BDD
            return `/public/${subFolder}/${uniqueName}`
        } catch (error: any) {
            console.error("[FileUtils] Échec de la sauvegarde physique du fichier :", error.message || error)
            return null
        }
    }
}