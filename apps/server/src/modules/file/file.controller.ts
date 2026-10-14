import type {Request, Response} from 'express'
import fs from 'fs'
import path from 'path'

import {FILE_TYPE, TABLE, type FileType, type Table} from '@randomstack/commons'

import FileAction from './file.action.js'
import FileMapper from './file.mapper.js'

/** Catégories / types autorisés sur l’upload public (évite path traversal). */
const ALLOWED_CATEGORIES = new Set<string>(Object.values(TABLE))
const ALLOWED_TYPES = new Set<string>(Object.values(FILE_TYPE))

const IMAGE_MIMES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
])
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

/** SVG volontairement exclu : scriptable si servi inline (XSS). */
const BLOCKED_MIMES = new Set(['image/svg+xml', 'text/html', 'application/xhtml+xml'])
const BLOCKED_EXTS = new Set(['.svg', '.html', '.htm', '.xhtml', '.js', '.mjs'])

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export default class FileController {
    static async upload(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({error: 'Aucun fichier reçu.'})
                return
            }

            if (req.file.size > MAX_UPLOAD_BYTES) {
                res.status(400).json({error: 'Fichier trop volumineux (5 Mo max).'})
                return
            }

            const type = String(req.body?.type || '').trim() as FileType
            const category = String(req.body?.category || '').trim() as Table

            if (!ALLOWED_TYPES.has(type) || !ALLOWED_CATEGORIES.has(category)) {
                res.status(400).json({error: "Paramètres 'type' ou 'category' invalides."})
                return
            }

            // Surface publique : images uniquement (profil, articles, technos)
            if (type !== FILE_TYPE.IMAGE) {
                res.status(400).json({error: 'Seuls les fichiers image sont acceptés.'})
                return
            }

            const ext = path.extname(req.file.originalname).toLowerCase()
            const mime = (req.file.mimetype || '').toLowerCase()

            if (BLOCKED_EXTS.has(ext) || BLOCKED_MIMES.has(mime)) {
                res.status(400).json({error: 'Ce type de fichier n’est pas autorisé.'})
                return
            }

            if (!IMAGE_EXTS.has(ext) || !IMAGE_MIMES.has(mime)) {
                res.status(400).json({
                    error: 'Image invalide. Formats acceptés : JPG, PNG, WebP, GIF.'
                })
                return
            }

            const savedFile = await FileAction.save(
                req.file.buffer,
                req.file.originalname,
                type,
                category,
                undefined,
                mime
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

            // UUID v4 basique — refuse les chemins / ids inventés
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
                res.status(400).json({error: 'Identifiant fichier invalide.'})
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

            res.setHeader('X-Content-Type-Options', 'nosniff')
            res.type(resolved.mimeType)
            res.sendFile(resolved.absolutePath)
        } catch (error: any) {
            console.error('[FileController] Erreur getFile :', error.message || error)
            res.status(500).json({error: 'Erreur serveur.'})
        }
    }
}
