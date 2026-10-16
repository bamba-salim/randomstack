import type {Request, Response} from 'express'
import crypto from 'crypto'
import {sendSafeError} from '#utils'
import TechnologyModel from '../models/technology.model'
import StackModel from '../models/stack.model.js'
import DrawAction from '../actions/draw.action'
import StackMapper from '../mappers/stack.mapper.js'
import TechnologyMapper from '../mappers/technology.mapper.js'
import type {Category} from '@randomstack/commons'

const HISTORY_MAX = 20
const SHARE_CODE_ATTEMPTS = 8

export default class StackController {
    /** Code court cryptographique (6 chars A-Z0-9). */
    private static generateShortCode(): string {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const bytes = crypto.randomBytes(6)
        let code = ''
        for (let i = 0; i < 6; i++) {
            code += alphabet[bytes[i]! % alphabet.length]
        }
        return code
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

            if (!req.session.history) {
                req.session.history = []
            }
            req.session.history.unshift(resolvedStack)
            req.session.history = req.session.history.slice(0, HISTORY_MAX)

            res.json(StackMapper.buildDrawResponse(resolvedStack, req.session.history))
        } catch (error) {
            sendSafeError(res, error, {
                label: '[StackController] Erreur draw',
                fallback: 'Une erreur est survenue lors du tirage.'
            })
        }
    }

    /**
     * Historique des tirages (session)
     * Cible : GET /fetch-draw-history
     */
    static async getHistory(req: Request, res: Response): Promise<void> {
        res.json(StackMapper.buildDrawHistoryResponse(req.session.history || []))
    }

    /** GET pool tirage / blacklist → ExcludeTechnologyLite[] */
    static async fetchDrawActiveTechnologies(_req: Request, res: Response): Promise<void> {
        try {
            const techs = await TechnologyModel.fetchActiveTechnologies()
            res.json(TechnologyMapper.buildExcludeTechnologyLiteList(techs))
        } catch (error) {
            sendSafeError(res, error, {
                label: '[StackController] Erreur fetchDrawActiveTechnologies',
                fallback: 'Erreur lors du chargement des technologies.'
            })
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

            const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            let saved = null

            for (let attempt = 0; attempt < SHARE_CODE_ATTEMPTS; attempt++) {
                const shareCode = StackController.generateShortCode()
                const existing = await StackModel.findByCode(shareCode)
                if (existing) continue

                try {
                    saved = await StackModel.create({
                        shareCode,
                        projectType: projectType as Category,
                        frontendId,
                        backendId,
                        databaseId,
                        ormId: ormId || null,
                        expiresAt: expirationDate,
                        createdAt: new Date()
                    })
                    break
                } catch (error: unknown) {
                    // Collision unique concurrente → retry
                    if (
                        error
                        && typeof error === 'object'
                        && (error as {code?: string}).code === 'P2002'
                    ) {
                        continue
                    }
                    throw error
                }
            }

            if (!saved) {
                res.status(500).json({error: 'Impossible de générer un code de partage unique.'})
                return
            }

            res.json(StackMapper.buildShareCreatedListed(saved))
        } catch (error: unknown) {
            sendSafeError(res, error, {
                label: '[StackController] Échec saveShare',
                fallback: 'Erreur lors de la création du lien de partage.'
            })
        }
    }

    /**
     * Résout un lien de partage via son code court
     * Cible : GET /fetch-share/:code
     */
    static async fetchShare(req: Request, res: Response): Promise<void> {
        try {
            const raw = String(req.params['code'] || '').trim()
            if (!raw) {
                res.status(400).json({error: 'Code de partage manquant.'})
                return
            }

            const shared = await StackModel.findByCode(raw.toUpperCase())

            if (!shared) {
                res.status(404).json({error: "Ce lien de partage n'existe pas."})
                return
            }

            if (new Date(shared.expiresAt) < new Date()) {
                res.status(410).json({error: 'Ce lien de partage a expiré.'})
                return
            }

            const allTechs = await TechnologyModel.fetchTechnologies()
            const listed = StackMapper.buildSharedStackListed(shared, allTechs)

            if (!listed.clientLayer || !listed.serverLayer || !listed.databaseLayer) {
                res.status(410).json({
                    error: 'Ce partage référence des technologies indisponibles.'
                })
                return
            }

            res.json(listed)
        } catch (error) {
            sendSafeError(res, error, {
                label: '[StackController] Échec fetchShare',
                fallback: 'Erreur lors de la récupération du partage.'
            })
        }
    }
}
