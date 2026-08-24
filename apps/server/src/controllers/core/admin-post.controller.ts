import type {Request, Response} from 'express'
import crypto from 'crypto'
import {PostModel} from '#models'
import {FileUtils} from '#utils'
import {PostMapper} from '#mappers'

export default class AdminPostController {
    // Initialisation et hydratation unifiée du FormBean depuis le serveur 🚀
    static async fetchEditPostInitialData(req: Request, res: Response): Promise<void> {
        try {
            let flatFormBean = PostMapper.getInitialFormBean()
            const {id} = req.params

            if (id) {
                const post = await PostModel.fetchPostById(id)
                if (!post) {
                    res.status(404).json({error: 'Article introuvable.'})
                    return
                }
                flatFormBean = PostMapper.fromDBToClientFormBean(post) // Corrigé de "tech" à "post" 🚀
            }

            res.json(flatFormBean)
        } catch {
            res.status(500).json({error: "Erreur lors de l'initialisation du formulaire."})
        }
    }

    // Sauvegarder un article (Création ou Édition) 🚀
    static async savePost(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            const targetId = id || crypto.randomUUID()
            const {status: reqStatus} = req.body

            let imageUrl = null
            let finalStatus = reqStatus
            let hasBeenPublishedFlag = false

            if (id) {
                const existingPost = await PostModel.fetchPostById(id)
                if (!existingPost) {
                    res.status(404).json({error: 'Article introuvable.'})
                    return
                }
                imageUrl = existingPost.imageUrl
                hasBeenPublishedFlag = existingPost.hasBeenPublished

                // RÈGLE A : Si l'article a déjà été en ligne, interdiction de le replanifier ! 🔒
                if (hasBeenPublishedFlag && reqStatus === 'SCHEDULED') {
                    res.status(400).json({error: "Un article qui a déjà été publié en ligne ne peut plus être planifié pour une date ultérieure."})
                    return
                }

                // RÈGLE B : Si l'article est PUBLISHED et qu'on l'édite sans cliquer sur "Publier" à nouveau, il repasse en brouillon (DRAFT) 🚀
                if (existingPost.status === 'PUBLISHED' && reqStatus !== 'PUBLISHED') {
                    finalStatus = 'DRAFT'
                }
            }

            if (finalStatus === 'PUBLISHED') {
                hasBeenPublishedFlag = true
            }

            if (req.file) {
                const savedPath = FileUtils.saveUpload(req.file.buffer, req.file.originalname, 'post', targetId)
                if (savedPath) {
                    imageUrl = savedPath
                }
            }

            const saveDTO = PostMapper.toSavePostDTO({
                ...req.body,
                status: finalStatus,
                hasBeenPublished: hasBeenPublishedFlag
            }, imageUrl, targetId)

            let result
            if (id) {
                result = await PostModel.updatePost(id, saveDTO)
            } else {
                result = await PostModel.createPost(saveDTO)
            }

            res.json({success: true, post: result})
        } catch (error: any) {
            console.error("[AdminPostController] Échec de la sauvegarde :", error.message || error)
            res.status(500).json({error: "Erreur lors de la sauvegarde de l'article."})
        }
    }

    static async fetchPosts(_req: Request, res: Response){
        try {
            const posts = await PostModel.fetchPosts()

        }catch (error: any) {

        }
    }
}