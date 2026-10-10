import type { Request, Response } from 'express'
import TechnologyModel from './technology.model'
import StackModel from './stack.model'
import DrawAction from './draw.action'
import StackMapper from './stack.mapper'
import type { Category } from '@randomstack/commons'

export default class StackController {
    private static generateShortCode(): string {
        return Math.random().toString(36).substring(2, 8).toUpperCase()
    }

    /**
     * Tirage aléatoire de la machine à sous avec gestion des cadenas et blacklist
     * Cible : POST /api/stacks/draw
     */
    static async draw(req: Request, res: Response): Promise<void> {
        try {
            const { locks, currentStack, blacklist } = req.body

            // Récupère uniquement les technologies actives
            const allTechs = await TechnologyModel.fetchActiveTechnologies()

            // 1. Filtrage par la Blacklist
            const blacklistedIds = Array.isArray(blacklist) ? blacklist : []
            const allowedTechs = allTechs.filter(t => !blacklistedIds.includes(t.id))

            // 2. Tirage aléatoire
            const newDraw = DrawAction.run(allowedTechs as any)

            // 3. Résolution des Cadenas (Locks)
            const finalClient = (locks?.client && currentStack) ? currentStack.clientLayer : newDraw.clientLayer
            const finalServer = (locks?.server && currentStack) ? currentStack.serverLayer : newDraw.serverLayer
            const finalDatabase = (locks?.database && currentStack) ? currentStack.databaseLayer : newDraw.databaseLayer

            const resolvedStack = {
                clientLayer: finalClient,
                serverLayer: finalServer,
                databaseLayer: finalDatabase,
                timestamp: newDraw.timestamp
            }

            // 4. Historique de session
            const session = (req as any).session || {}
            if (!session.history) {
                session.history = []
            }
            session.history.unshift(resolvedStack)

            res.json({
                current: resolvedStack,
                history: session.history
            })
        } catch (error) {
            console.error('[StackController] Erreur draw :', error)
            res.status(500).json({ error: 'Une erreur est survenue lors du tirage.' })
        }
    }

    /**
     * Récupère l'historique des tirages stocké dans la session
     * Cible : GET /api/stacks/history
     */
    static async getHistory(req: Request, res: Response): Promise<void> {
        const session = (req as any).session || {}
        res.json({
            history: session.history || []
        })
    }

    /**
     * Enregistre une combinaison partagée (expire après 7 jours)
     * Cible : POST /api/stacks/share
     */
    static async saveShare(req: Request, res: Response): Promise<void> {
        try {
            const { projectType, frontendId, backendId, databaseId, ormId } = req.body

            if (!projectType || !frontendId || !backendId || !databaseId) {
                res.status(400).json({ error: 'Données de tirage incomplètes pour le partage.' })
                return
            }

            const shareCode = StackController.generateShortCode()
            const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

            const saved = await StackModel.create({
                shareCode,
                projectType: projectType as Category,
                frontendId,
                backendId,
                databaseId,
                ormId: ormId || null,
                expiresAt: expirationDate,
                createdAt: new Date()
            })

            res.json({
                success: true,
                shareCode: saved.shareCode,
                expiresAt: saved.expiresAt
            })
        } catch (error: any) {
            console.error('[StackController] Échec saveShare :', error.message || error)
            res.status(500).json({ error: 'Erreur lors de la création du lien de partage.' })
        }
    }

    /**
     * Résout un lien de partage via son code court
     * Cible : GET /api/stacks/share/:code
     */
    static async fetchShare(req: Request, res: Response): Promise<void> {
        try {
            const { code } = req.params
            const shared = await StackModel.findByCode(code.toUpperCase())

            if (!shared) {
                res.status(404).json({ error: "Ce lien de partage n'existe pas." })
                return
            }

            if (new Date(shared.expiresAt) < new Date()) {
                res.status(410).json({ error: 'Ce lien de partage a expiré.' })
                return
            }

            const allTechs = await TechnologyModel.fetchTechnologies()
            res.json(StackMapper.buildSharedStackResponse(shared, allTechs as any))
        } catch (error) {
            console.error('[StackController] Échec fetchShare :', error)
            res.status(500).json({ error: 'Erreur lors de la récupération du partage.' })
        }
    }
}