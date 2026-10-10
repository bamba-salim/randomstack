import type {Request, Response} from 'express'
import crypto from 'crypto'
import TechnologyModel from '../models/technology.model'
import TechnologyMapper from '../mappers/technology.mapper'

export default class AdminTechnologyController {

    /**
     * Initialisation du FormBean pour l'Extranet (création ou édition)
     * Cible : GET /api/admin/technologies/form-bean/:id?
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
                formBean = TechnologyMapper.fromDBToClientFormBean(tech)
            }

            res.json(formBean)
        } catch (error) {
            console.error('[AdminTechnologyController] Erreur initialData :', error)
            res.status(500).json({error: "Erreur lors de l'initialisation du formulaire."})
        }
    }

    /**
     * Sauvegarde d'une technologie en JSON pur (l'upload de fichier passe par le module file)
     * Cible : POST /api/admin/technologies / PUT /api/admin/technologies/:id
     */
    static async saveTechnology(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            const targetId = id || crypto.randomUUID()

            if (id) {
                const existingTech = await TechnologyModel.fetchTechnologyById(id)
                if (!existingTech) {
                    res.status(404).json({error: 'Technologie introuvable.'})
                    return
                }
            }

            const editDTO = TechnologyMapper.toSaveTechnologyDTO(req.body, targetId)

            const result = id
                ? await TechnologyModel.updateTechnology(id, editDTO)
                : await TechnologyModel.createTechnology(editDTO)

            res.json({success: true, technology: result})
        } catch (error: any) {
            console.error('[AdminTechnologyController] Échec saveTechnology :', error.message || error)
            res.status(500).json({error: 'Erreur lors de la sauvegarde de la technologie.'})
        }
    }


    static async fetchTechnologies(req: Request, res: Response) {
        try {
            const technos = await TechnologyModel.getTechnologies()
            res.json(technos)

        } catch (error) {
            console.error('[AdminTechnologyController] Échec saveTechnology :', error.message || error)
            res.status(500).json({error: 'Erreur lors de la sauvegarde de la technologie.'})
        }

    }
}