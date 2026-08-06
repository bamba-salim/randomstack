import type {Request, Response} from 'express'

import {TechnologyModel, StackModel} from '#models'
import {DrawAction} from '#action-support'

import type {Category} from '@randomstack/commons'


export default class StackController {

    private static generateShortCode(): string {
        return Math.random().toString(36).substring(2, 8).toUpperCase()
    }

    static async draw(req: Request, res: Response): Promise<void> {
        try {
            const {locks, currentStack, blacklist} = req.body

            const allTechs = await TechnologyModel.findAll()

            // 1. Filtrage par la Blacklist (exclure les IDs d'une liste) 🚀
            const blacklistedIds = Array.isArray(blacklist) ? blacklist : []
            const allowedTechs = allTechs.filter(t => !blacklistedIds.includes(t.id))

            // 2. Tirage aléatoire uniquement sur les technologies autorisées 🚀
            const newDraw = DrawAction.run(allowedTechs)

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

            // 4. Enregistrement de la stack réellement résolue dans la session
            const session = req.session as any
            if (!session.history) {
                session.history = []
            }
            session.history.unshift(resolvedStack)

            res.json({
                current: resolvedStack,
                history: session.history
            })
        } catch (error) {
            res.status(500).json({error: 'Une erreur est survenue lors du tirage.'})
        }
    }

    static async getHistory(req: Request, res: Response): Promise<void> {
        const session = req.session as any
        res.json({
            history: session.history || []
        })
    }

    static async saveShare(req: Request, res: Response): Promise<void> {
        try {

            //TODO: creae dto and mapper
            const { projectType, frontendId, backendId, databaseId, ormId } = req.body

            if (!projectType || !frontendId || !backendId || !databaseId) {
                res.status(400).json({ error: 'Données de tirage incomplètes pour le partage.' })
                return
            }

            const shareCode = this.generateShortCode()
            const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

            //TODO: creae dto and mapper
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
            console.error("[StackController] Échec saveShare :", error.message || error)
            res.status(500).json({ error: 'Erreur lors de la création du lien de partage.' })
        }
    }

    static async fetchShare(req: Request, res: Response): Promise<void> {
        try {
            const { code } = req.params
            const shared = await StackModel.findByCode(code.toUpperCase())

            if (!shared) {
                res.status(404).json({ error: "Ce lien de partage n'existe pas." })
                return
            }

            if (new Date(shared.expiresAt) < new Date()) {
                res.status(410).json({ error: "Ce lien de partage a expiré." })
                return
            }

            const allTechs = await TechnologyModel.findAll()
            const getTech = (id: string) => allTechs.find(t => t.id === id) || null

            res.json({
                projectType: shared.projectType,
                clientLayer: getTech(shared.frontendId),
                serverLayer: getTech(shared.backendId),
                databaseLayer: getTech(shared.databaseId),
                timestamp: shared.createdAt.toLocaleTimeString('fr-FR')
            })
        } catch {
            res.status(500).json({ error: 'Erreur lors de la récupération du partage.' })
        }
    }

}