import type {Request, Response} from 'express'
import {TechnologyModel} from '#models'
import {FileUtils} from '#utils'
import {TechnologyMapper} from '#mappers'
import {Category} from '@prisma/client'

export default class TechnologyController {

    // 1. Lister toutes les technologies 🚀
    static async getAll(_req: Request, res: Response): Promise<void> {
        try {
            const techs = await TechnologyModel.findAll()
            res.json(techs)
        } catch {
            res.status(500).json({error: 'Erreur lors du chargement des technologies.'})
        }
    }

    // 2. Récupérer une technologie par son ID 🚀
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            const tech = await TechnologyModel.findById(id)
            if (!tech) {
                res.status(404).json({error: 'Technologie introuvable.'})
                return
            }
            res.json(tech)
        } catch {
            res.status(500).json({error: 'Erreur lors de la récupération de la technologie.'})
        }
    }

    // Point d'entrée d'écriture unique (Si ID => Edit, si absent => Create) 🚀
    static async save(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            const targetId = id || crypto.randomUUID()
            let logoUrl = null

            if (id) {
                const existingTech = await TechnologyModel.findById(id)
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

            // Utilisation de la couche de transformation de données 🚀
            const saveDTO = TechnologyMapper.toSaveDTO(req.body, logoUrl, targetId)



            let result
            if (id) {
                result = await TechnologyModel.update(saveDTO)
            } else {
                result = await TechnologyModel.create(saveDTO)
            }

            res.json({success: true, technology: result})
        } catch (error: any) {
            console.error("[TechnologyController] Échec de la sauvegarde :", error.message || error)
            res.status(500).json({error: 'Erreur lors de la sauvegarde.'})
        }
    }
}