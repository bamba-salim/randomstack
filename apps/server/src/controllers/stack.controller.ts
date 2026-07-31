import type { Request, Response } from 'express'
import { TechnologyModel } from '#models'
import { DrawAction } from '#action-support'

export default class StackController {
    static async draw(req: Request, res: Response): Promise<void> {
        try {
            const techs = await TechnologyModel.findAll()
            const drawnStack = DrawAction.run(techs)

            const session = req.session as any
            if (!session.history) {
                session.history = []
            }

            session.history.unshift(drawnStack)

            res.json({
                current: drawnStack,
                history: session.history
            })
        } catch (error) {
            res.status(500).json({ error: 'Une erreur est survenue lors du tirage.' })
        }
    }

    static async getHistory(req: Request, res: Response): Promise<void> {
        const session = req.session as any
        res.json({
            history: session.history || []
        })
    }

    static async fetcTechnologies(req: Request, res: Response): Promise<void> {
        const technologies = await TechnologyModel.findAll()
        res.json(technologies)
    }
}