import type { Request, Response } from 'express'
import crypto from 'crypto'
import { PostModel } from '#models'
import { FileAction } from '#action-support'
import { PostMapper } from '#mappers'
import type { FILE_TYPE , TABLE} from '@randomstack/commons'

export default class AdminPostController {

    static async fetchEditPostInitialData(req: Request, res: Response): Promise<void> {
        try {
            let flatFormBean = PostMapper.getInitialFormBean()
            const { id } = req.params

            if (id) {
                const post = await PostModel.fetchPostById(id)
                if (!post) {
                    res.status(404).json({ error: 'Article introuvable.' })
                    return
                }
                flatFormBean = PostMapper.fromDBToClientFormBean(post)
            }

            res.json(flatFormBean)
        } catch {
            res.status(500).json({ error: "Erreur lors de l'initialisation du formulaire." })
        }
    }

    static async savePost(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const targetId = id || crypto.randomUUID()
            const { status: reqStatus } = req.body

            let imageId: string | null = null
            let finalStatus = reqStatus
            let hasBeenPublishedFlag = false

            if (id) {
                const existingPost = await PostModel.fetchPostById(id)
                if (!existingPost) {
                    res.status(404).json({ error: 'Article introuvable.' })
                    return
                }
                imageId = existingPost.imageId
                hasBeenPublishedFlag = existingPost.hasBeenPublished

                if (hasBeenPublishedFlag && reqStatus === 'SCHEDULED') {
                    res.status(400).json({ error: "Un article déjà publié ne peut plus être planifié." })
                    return
                }

                if (existingPost.status === 'PUBLISHED' && reqStatus !== 'PUBLISHED') {
                    finalStatus = 'DRAFT'
                }
            }

            if (finalStatus === 'PUBLISHED') {
                hasBeenPublishedFlag = true
            }

            // Gestion de l'image via FileAction 🚀
            if (req.file) {
                const savedFile = await FileAction.savePostImage(req.file)
                if (savedFile) {
                    // Nettoyage de l'ancienne image si elle existait 🗑️
                    if (id && imageId) {
                        await FileAction.delete(imageId)
                    }
                    imageId = savedFile.id
                }
            }

            const saveDTO = PostMapper.toSavePostDTO({
                ...req.body,
                status: finalStatus,
                hasBeenPublished: hasBeenPublishedFlag
            }, imageId, targetId)

            const result = id
                ? await PostModel.updatePost(id, saveDTO)
                : await PostModel.createPost(saveDTO)

            res.json({ success: true, post: result })
        } catch (error: any) {
            console.error("[AdminPostController] Échec de la sauvegarde :", error.message || error)
            res.status(500).json({ error: "Erreur lors de la sauvegarde de l'article." })
        }
    }

    static async fetchPosts(_req: Request, res: Response): Promise<void> {
        try {
            const posts = await PostModel.fetchAllPosts()
            res.json(posts)
        } catch (error: any) {
            console.error("[AdminPostController] Erreur fetchAll :", error)
            res.status(500).json({ error: "Impossible de récupérer les articles." })
        }
    }

    static async deletePost(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const existing = await PostModel.fetchPostById(id)
            if (!existing) {
                res.status(404).json({ error: 'Article introuvable.' })
                return
            }

            await PostModel.softDeletePost(id)
            res.json({ success: true })
        } catch (error: any) {
            console.error("[AdminPostController] Échec deletePost :", error)
            res.status(500).json({ error: "Erreur lors de la suppression." })
        }
    }

    private static async saveImagePost() {

    }
}