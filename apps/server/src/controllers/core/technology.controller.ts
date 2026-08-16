import type {Request, Response} from 'express'
import crypto from 'crypto'
import {TechnologyModel} from '#models'
import {FileUtils} from '#utils'
import {TechnologyMapper} from '#mappers'
import type {EditTechnology, EditTechnologyFormBean} from "@randomstack/commons";

export default class TechnologyController {

    static async fetchTechnologies(_req: Request, res: Response): Promise<void> { // Verbeux 🚀
        try {
            const techs = await TechnologyModel.fetchTechnologies()
            res.json(techs)
        } catch {
            res.status(500).json({error: 'Erreur lors du chargement des technologies.'})
        }
    }

    static async fetchTechnologyById(req: Request, res: Response): Promise<void> { // Verbeux 🚀
        try {
            const {id} = req.params
            const tech = await TechnologyModel.fetchTechnologyById(id)
            if (!tech) {
                res.status(404).json({error: 'Technologie introuvable.'})
                return
            }
            const flatFormBean = TechnologyMapper.fromDBToClientFormBean(tech)
            res.json(flatFormBean)
        } catch {
            res.status(500).json({error: 'Erreur lors de la récupération de la technologie.'})
        }
    }

    static async fetchEditTechnologyInitialData(req: Request, res: Response): Promise<void> {

        try {
            let flatFormBean = TechnologyMapper.getInitialFormBean()

            const {id} = req.params

            if (id) {
                const tech = await TechnologyModel.fetchTechnologyById(id)
                if (!tech) {
                    res.status(404).json({error: 'Technologie introuvable.'})
                    return
                }
                flatFormBean = TechnologyMapper.fromDBToClientFormBean(tech)
            }

            res.json(flatFormBean)

        } catch {
            res.status(500).json({error: 'Erreur lors de la récupération de la technologie.'})
        }
    }

    static async saveTechnology(req: Request, res: Response): Promise<void> { // Verbeux 🚀
        try {
            const {id} = req.params
            const targetId = id || crypto.randomUUID()

            let logoUrl = null

            if (id) {
                const existingTech = await TechnologyModel.fetchTechnologyById(id)
                if (!existingTech) {
                    res.status(404).json({error: 'Technologie introuvable.'})
                    return
                }
                logoUrl = existingTech.logo
            }

            if (req.file) {
                const savedPath = FileUtils.saveUpload(req.file.buffer, req.file.originalname, 'technology', targetId)
                if (savedPath) {
                    logoUrl = savedPath
                }
            }

            const editDTO = <EditTechnology>TechnologyMapper.toSaveTechnologyDTO(req.body, logoUrl, targetId)


            let result
            if (id) {
                result = await TechnologyModel.updateTechnology(id, editDTO)
            } else {
                result = await TechnologyModel.createTechnology(editDTO)
            }

            res.json({success: true, technology: result})
        } catch (error: any) {
            console.error("[TechnologyController] Échec de la sauvegarde :", error.message || error)
            res.status(500).json({error: 'Erreur lors de la sauvegarde.'})
        }
    }

    static async fetchTechnologyBySlug(req: Request, res: Response): Promise<void> {
        try {
            const {slug} = req.params
            const tech = await TechnologyModel.fetchTechnologyBySlug(slug) // Interroge le modèle statique 🚀
            if (!tech) {
                res.status(404).json({error: 'Technologie introuvable.'})
                return
            }
            res.json(tech)
        } catch {
            res.status(500).json({error: 'Erreur lors de la récupération de la technologie.'})
        }
    }

}