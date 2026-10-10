import type {Request, Response} from 'express'
import TechnologyModel from '../models/technology.model'
import StackModel from '../models/stack.model.js'
import DrawAction from '../actions/draw.action'
import StackMapper from '../mappers/stack.mapper.js'
import TechnologyMapper from '../mappers/technology.mapper.js'
import type {Category} from '@randomstack/commons'

export default class StackController {
    private static generateShortCode(): string {
        return Math.random().toString(36).substring(2, 8).toUpperCase()
    }

    /**
     * Tirage aléatoire de la machine à sous avec gestion des cadenas et blacklist
     * Cible : POST /draw-stack
     */
    static async draw(req: Request, res: Response): Promise<void> {
        try {
            const {locks, currentStack, blacklist} = req.body

            const allTechs = await TechnologyModel.fetchActiveTechnologies()

            const blacklistedIds = Array.isArray(blacklist) ? blacklist : []
            const allowedTechs = allTechs.filter(t => !blacklistedIds.includes(t.id))

            const newDraw = DrawAction.run(allowedTechs)

            const mapLocked = (layer: any) => TechnologyMapper.buildDrawTechnologyLite(layer)

            const resolvedStack = StackMapper.buildDrawnStack(
                (locks?.client && currentStack?.clientLayer)
                    ? mapLocked(currentStack.clientLayer)
                    : newDraw.clientLayer,
                (locks?.server && currentStack?.serverLayer)
                    ? mapLocked(currentStack.serverLayer)
                    : newDraw.serverLayer,
                (locks?.database && currentStack?.databaseLayer)
                    ? mapLocked(currentStack.databaseLayer)
                    : newDraw.databaseLayer,
                newDraw.timestamp
            )

            const session = (req as any).session || {}
            if (!session.history) {
                session.history = []
            }
            session.history.unshift(resolvedStack)

            res.json(StackMapper.buildDrawResponse(resolvedStack, session.history))
        } catch (error) {
            console.error('[StackController] Erreur draw :', error)
            res.status(500).json({error: 'Une erreur est survenue lors du tirage.'})
        }
    }

    /**
     * Historique des tirages (session)
     * Cible : GET /fetch-draw-history
     */
    static async getHistory(req: Request, res: Response): Promise<void> {
        const session = (req as any).session || {}
        res.json(StackMapper.buildDrawHistoryResponse(session.history || []))
    }

    /** GET pool tirage / blacklist → ExcludeTechnologyLite[] */
    static async fetchDrawActiveTechnologies(_req: Request, res: Response): Promise<void> {
        try {
            const techs = await TechnologyModel.fetchActiveTechnologies()
            res.json(TechnologyMapper.buildExcludeTechnologyLiteList(techs))
        } catch (error) {
            console.error('[StackController] Erreur fetchDrawActiveTechnologies :', error)
            res.status(500).json({error: 'Erreur lors du chargement des technologies.'})
        }
    }

    /**
     * Enregistre une combinaison partagée (expire après 7 jours)
     * Cible : POST /save-share
     */
    static async saveShare(req: Request, res: Response): Promise<void> {
        try {
            const {projectType, frontendId, backendId, databaseId, ormId} = req.body

            if (!projectType || !frontendId || !backendId || !databaseId) {
                res.status(400).json({error: 'Données de tirage incomplètes pour le partage.'})
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

            res.json(StackMapper.buildShareCreatedListed(saved))
        } catch (error: any) {
            console.error('[StackController] Échec saveShare :', error.message || error)
            res.status(500).json({error: 'Erreur lors de la création du lien de partage.'})
        }
    }

    /**
     * Résout un lien de partage via son code court
     * Cible : GET /fetch-share/:code
     */
    static async fetchShare(req: Request, res: Response): Promise<void> {
        try {
            const {code} = req.params
            const shared = await StackModel.findByCode(code.toUpperCase())

            if (!shared) {
                res.status(404).json({error: "Ce lien de partage n'existe pas."})
                return
            }

            if (new Date(shared.expiresAt) < new Date()) {
                res.status(410).json({error: 'Ce lien de partage a expiré.'})
                return
            }

            const allTechs = await TechnologyModel.fetchTechnologies()
            res.json(StackMapper.buildSharedStackListed(shared, allTechs as any))
        } catch (error) {
            console.error('[StackController] Échec fetchShare :', error)
            res.status(500).json({error: 'Erreur lors de la récupération du partage.'})
        }
    }
}
