import type {Request, Response} from 'express'
import fs from 'fs'

import type {Table, FileType} from '@randomstack/commons'

import FileAction from './file.action.js'
import FileMapper from './file.mapper.js'

export default class FileController {
    static async upload(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({error: 'Aucun fichier reçu.'})
                return
            }

            const {type, category} = req.body

            if (!type || !category) {
                res.status(400).json({error: "Les paramètres 'type' et 'category' sont requis."})
                return
            }

            const savedFile = await FileAction.save(
                req.file.buffer,
                req.file.originalname,
                type as FileType,
                category as Table,
                undefined,
                req.file.mimetype
            )

            if (!savedFile) {
                res.status(500).json({error: "Échec de l'enregistrement en base de données."})
                return
            }

            const url = FileAction.getUrl(savedFile as any)
            res.json(FileMapper.buildUploadedFileListed(savedFile, url))
        } catch (error: any) {
            console.error('[FileController] Erreur upload :', error.message || error)
            res.status(500).json({error: 'Erreur serveur lors du téléversement.'})
        }
    }

    /**
     * Gate publique : 302 vers URL présignée Railway (ou sendFile en local).
     * Les fronts gardent toujours `/files/:id`.
     */
    static async getFile(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            if (!id) {
                res.status(400).json({error: 'Identifiant fichier manquant.'})
                return
            }

            const resolved = await FileAction.getSignedOrLocalPath(id)
            if (!resolved) {
                res.status(404).json({error: 'Fichier introuvable.'})
                return
            }

            if (resolved.kind === 'redirect') {
                res.redirect(302, resolved.url)
                return
            }

            if (!fs.existsSync(resolved.absolutePath)) {
                res.status(404).json({error: 'Fichier introuvable.'})
                return
            }

            res.type(resolved.mimeType)
            res.sendFile(resolved.absolutePath)
        } catch (error: any) {
            console.error('[FileController] Erreur getFile :', error.message || error)
            res.status(500).json({error: 'Erreur serveur.'})
        }
    }
}
