import type {Request, Response} from 'express'
import crypto from 'crypto'
import {PostModel} from '#models'
import {FileAction} from '#action-support'
import {PostMapper} from '#mappers'
import {type FILE_TYPE, type PostContentBlock, type TABLE, type BLOCK_TYPE} from '@randomstack/commons'

export default class AdminPostController {

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
                flatFormBean = PostMapper.fromDBToClientFormBean(post)
            }

            res.json(flatFormBean)
        } catch {
            res.status(500).json({error: "Erreur lors de l'initialisation du formulaire."})
        }
    }

// Sauvegarder un article (Création ou Édition en JSON pur) 🚀
    static async savePost(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            const targetId = id || crypto.randomUUID()

            // On récupère directement l'ID de la nouvelle image depuis le JSON envoyé par le client ! 🚀
            const {status: reqStatus, imageId: reqImageId} = req.body

            let imageId: string | null = reqImageId || null
            let finalStatus = reqStatus
            let hasBeenPublishedFlag = req.body.hasBeenPublished || false

            if (id) {
                const existingPost = await PostModel.fetchPostById(id)
                if (!existingPost) {
                    res.status(404).json({error: 'Article introuvable.'})
                    return
                }

                hasBeenPublishedFlag = existingPost.hasBeenPublished

                // NETTOYAGE : Si l'article avait déjà une image de couverture,
                // ET que l'admin en a uploadé une NOUVELLE (l'ID a changé), on efface l'ancienne ! 🗑️
                if (existingPost.imageId && existingPost.imageId !== imageId) {
                    await FileAction.delete(existingPost.imageId)
                }

                // RÈGLE A : Interdiction de replanifier un article déjà publié
                if (hasBeenPublishedFlag && reqStatus === 'SCHEDULED') {
                    res.status(400).json({error: "Un article déjà publié ne peut plus être planifié."})
                    return
                }

                // RÈGLE B : Rétrograder en brouillon si on modifie sans publier
                if (existingPost.status === 'PUBLISHED' && reqStatus !== 'PUBLISHED') {
                    finalStatus = 'DRAFT'
                }
            }

            if (finalStatus === 'PUBLISHED') {
                hasBeenPublishedFlag = true
            }

            // LE BLOC "if (req.file)" A DISPARU : L'upload a déjà été fait avant la sauvegarde ! 🚀

            const saveDTO = PostMapper.toSavePostDTO({
                ...req.body,
                status: finalStatus,
                hasBeenPublished: hasBeenPublishedFlag
            }, imageId, targetId)

            const result = id
                ? await PostModel.updatePost(id, saveDTO)
                : await PostModel.createPost(saveDTO)

            res.json({success: true, post: result})
        } catch (error: any) {
            console.error("[AdminPostController] Échec savePost :", error.message || error)
            res.status(500).json({error: "Erreur lors de la sauvegarde de l'article."})
        }
    }

    static async fetchPosts(_req: Request, res: Response): Promise<void> {
        try {
            const posts = await PostModel.fetchAllPosts()
            res.json(posts)
        } catch (error: any) {
            console.error("[AdminPostController] Erreur fetchAll :", error)
            res.status(500).json({error: "Impossible de récupérer les articles."})
        }
    }

    static async deletePost(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            const existing = await PostModel.fetchPostById(id)
            if (!existing) {
                res.status(404).json({error: 'Article introuvable.'})
                return
            }

            await PostModel.softDeletePost(id)
            res.json({success: true})
        } catch (error: any) {
            console.error("[AdminPostController] Échec deletePost :", error)
            res.status(500).json({error: "Erreur lors de la suppression."})
        }
    }

    static async fetchPostsContents(req: Request, res: Response): Promise<void> {
        const contentsPosts: Posts[] = (await PostModel.getPostsContents()).map((post) => post.content)

        const imageContents: PostContentBlock = []
        contentsPosts.forEach(contents => contents.forEach(content => {
                if (content.type === 'IMAGE') {
                    imageContents.push(content)
                }

                if (content.type === 'DOUBLE_CONTENT') {
                    if (content.left.type === 'IMAGE') imageContents.push(content.left)
                    if (content.right.type === 'IMAGE') imageContents.push(content.right)
                }
            })
        )

        res.json({size: imageContents.length, data: imageContents})
    }


}