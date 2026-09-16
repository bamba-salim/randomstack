import type {Request, Response} from 'express'
import {FileAction} from '#action-support'
import type {Table, FileType} from '@randomstack/commons'
import {FileModel} from '#models'
import path from 'path'


export default class FileController {
    // Cible : POST /api/admin/upload-file 🚀
    static async upload(req: Request, res: Response): Promise<void> {
        // try {

        if (!req.file) {
            res.status(400).json({error: "Aucun fichier reçu."})
            return
        }

        // On récupère les métadonnées envoyées depuis le FormData du client 🚀
        const {type, category} = req.body

        if (!type || !category) {
            res.status(400).json({error: "Les paramètres 'type' et 'category' sont requis."})
            return
        }

        // TODO: file mapper

        // Sauvegarde universelle via l'Action Support
        const savedFile = await FileAction.save(
            req.file.buffer,
            req.file.originalname,
            type as FileType,
            category as Table
        )

        if (!savedFile) {
            res.status(500).json({error: "Échec de l'enregistrement en base de données."})
            return
        }

        const url = FileAction.getUrl(savedFile)

        res.json({idFile: savedFile.id, url})
        // } catch (error: any) {
        //   console.error("[FileController] Erreur d'upload :", error.message || error)
        // res.status(500).json({error: "Erreur serveur lors du téléversement."})
        // }
    }

    // NOUVELLE MÉTHODE : Servir un fichier directement par son ID 🚀
    static async getFile(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params

            const relativePath = await FileAction.getUrlByID(id)

            const absolutePath = path.join(process.cwd(), relativePath)
            res.sendFile(absolutePath)
        } catch (error: any) {
            console.error("[FileController] Erreur getFile :", error.message || error)
            res.status(500).json({error: "Erreur serveur."})
        }
    }
}