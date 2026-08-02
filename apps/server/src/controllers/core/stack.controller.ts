import type {Request, Response} from 'express'

import {TechnologyModel} from '#models'

import {DrawAction} from '#action-support'

export default class StackController {

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

    static async fetchTechnologies(req: Request, res: Response): Promise<void> {
        try {
            const techs = await TechnologyModel.findAll()
            res.json(techs)
        } catch {
            res.status(500).json({error: 'Erreur lors du chargement des technologies.'})
        }
    }

}