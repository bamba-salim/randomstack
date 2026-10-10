import type {Request, Response} from 'express'
import TechnologyModel from '../models/technology.model'
import TechnologyMapper from '../mappers/technology.mapper'

export default class TechnologyController {

    /** GET encyclopédie → PublicTechnologyListed[] */
    static async fetchTechnologies(_req: Request, res: Response): Promise<void> {
        try {
            const techs = await TechnologyModel.fetchTechnologies()
            res.json(TechnologyMapper.buildPublicTechnologyListedList(techs))
        } catch (error) {
            console.error('[TechnologyController] Erreur fetchTechnologies :', error)
            res.status(500).json({error: 'Erreur lors du chargement des technologies.'})
        }
    }

    /** GET fiche publique → PublicTechnologyDetail */
    static async fetchTechnologyBySlug(req: Request, res: Response): Promise<void> {
        try {
            const {slug} = req.params
            const tech = await TechnologyModel.fetchTechnologyBySlug(slug)

            if (!tech) {
                res.status(404).json({error: 'Technologie introuvable.'})
                return
            }

            res.json(TechnologyMapper.buildPublicTechnologyDetail(tech))
        } catch (error) {
            console.error('[TechnologyController] Erreur fetchTechnologyBySlug :', error)
            res.status(500).json({error: 'Erreur lors de la récupération de la technologie.'})
        }
    }
}
