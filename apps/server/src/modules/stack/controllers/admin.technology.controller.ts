import type {Request, Response} from 'express'
import crypto from 'crypto'
import type {EditTechnologyFormBean} from '@randomstack/commons'
import TechnologyModel from '../models/technology.model'
import TechnologyCompatibilityModel from '../models/technology-compatibility.model'
import TechnologyMapper from '../mappers/technology.mapper'

export default class AdminTechnologyController {

    /**
     * Initialisation du FormBean pour l'Extranet (création ou édition)
     * Cible : GET /ws/fetch-technology-init-form-data/:id?
     */
    static async fetchEditTechnologyInitialData(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            let formBean = TechnologyMapper.getInitialFormBean()

            if (id) {
                const tech = await TechnologyModel.fetchTechnologyById(id)
                if (!tech) {
                    res.status(404).json({error: 'Technologie introuvable.'})
                    return
                }
                const compatRows = await TechnologyCompatibilityModel.fetchForTechnology(id)
                formBean = TechnologyMapper.fromDBToClientFormBean(tech, compatRows)
            }

            res.json(formBean)
        } catch (error) {
            console.error('[AdminTechnologyController] Erreur initialData :', error)
            res.status(500).json({error: "Erreur lors de l'initialisation du formulaire."})
        }
    }

    /**
     * Sauvegarde d'une technologie en JSON pur (l'upload de fichier passe par le module file)
     */
    static async saveTechnology(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            const targetId = id || crypto.randomUUID()
            const body = req.body as EditTechnologyFormBean

            if (id) {
                const existingTech = await TechnologyModel.fetchTechnologyById(id)
                if (!existingTech) {
                    res.status(404).json({error: 'Technologie introuvable.'})
                    return
                }
            }

            const editDTO = TechnologyMapper.toSaveTechnologyDTO(body, targetId)

            const result = id
                ? await TechnologyModel.updateTechnology(id, editDTO)
                : await TechnologyModel.createTechnology(editDTO)

            const links = TechnologyMapper.extractCompatLinksFromBody(body)
            const sync = await TechnologyCompatibilityModel.replaceForTechnology(
                result.id,
                links,
                result.categories as EditTechnologyFormBean['categories']
            )

            if (!sync.ok) {
                res.status(400).json({error: sync.error, field: 'compatibilities'})
                return
            }

            res.json(TechnologyMapper.buildSaveTechnologyResponse(result))
        } catch (error: any) {
            console.error('[AdminTechnologyController] Échec saveTechnology :', error.message || error)
            res.status(500).json({error: 'Erreur lors de la sauvegarde de la technologie.'})
        }
    }


    /** GET table admin → AdminTechnologyListed[] */
    static async fetchTechnologies(_req: Request, res: Response) {
        try {
            const technos = await TechnologyModel.getTechnologies()
            res.json(TechnologyMapper.buildAdminTechnologyListedList(technos))
        } catch (error) {
            console.error('[AdminTechnologyController] Échec fetchTechnologies :', error)
            res.status(500).json({error: 'Erreur lors du chargement des technologies.'})
        }
    }
}
