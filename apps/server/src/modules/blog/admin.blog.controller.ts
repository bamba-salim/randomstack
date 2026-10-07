import type {Request, Response} from 'express'
import crypto from 'crypto'
import {FileAction} from '#file'

import BlogModel from './blog.model'
import BlogMapper from './blog.mapper'

import type {EditPostFormBean} from '@randomstack/commons'

export default class AdminBlogController {

    /**
     * Initialisation du formulaire Extranet (FormBean)
     * Fournit un FormBean vide pour la création ou pré-rempli pour la modification
     * Cible : GET /api/admin/posts/form-bean / GET /api/admin/posts/form-bean/:id
     */
    static async fetchEditPostInitialData(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            let formBean = BlogMapper.getInitialFormBean()

            if (id) {
                const post = await BlogModel.fetchPostById(id)
                if (!post) {
                    res.status(404).json({error: 'Article introuvable.'})
                    return
                }
                formBean = BlogMapper.fromDBToClientFormBean(post)
            }

            res.json(formBean)
        } catch (error: any) {
            console.error('[AdminBlogController] Erreur fetchEditPostInitialData :', error.message || error)
            res.status(500).json({error: "Erreur lors de l'initialisation du formulaire."})
        }
    }

    /**
     * Sauvegarde d'un article (Création ou Édition)
     * Gère les règles de publication, permaliens immuables et remplacement d'image
     * Cible : POST /api/admin/posts / PUT /api/admin/posts/:id
     */
    static async savePost(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            const targetId = id || crypto.randomUUID()
            const formBean = req.body as EditPostFormBean

            const {status: reqStatus} = formBean
            let finalStatus = reqStatus
            let hasBeenPublishedFlag = formBean.hasBeenPublished || false

            if (id) {
                const existingPost = await BlogModel.fetchPostById(id)
                if (!existingPost) {
                    res.status(404).json({error: 'Article introuvable.'})
                    return
                }

                hasBeenPublishedFlag = existingPost.hasBeenPublished

                // Nettoyage de l'ancienne image si elle a été remplacée
                if (existingPost.imageId && existingPost.imageId !== formBean.imageId) {
                    await FileAction.delete(existingPost.imageId).catch((err) =>
                        console.warn('[AdminBlogController] Échec suppression ancienne image :', err)
                    )
                }

                // Règle métier : interdiction de replanifier un article déjà publié
                if (hasBeenPublishedFlag && reqStatus === 'SCHEDULED') {
                    res.status(400).json({error: 'Un article déjà publié ne peut plus être planifié.'})
                    return
                }

                // Règle métier : rétrograde en brouillon si on modifie sans republier
                if (existingPost.status === 'PUBLISHED' && reqStatus !== 'PUBLISHED') {
                    finalStatus = 'DRAFT'
                }
            }

            if (finalStatus === 'PUBLISHED') {
                hasBeenPublishedFlag = true
            }

            // Transformation sécurisée du FormBean en DTO BDD via le Mapper
            const saveDTO = BlogMapper.toSavePostDTO({
                ...formBean,
                status: finalStatus,
                hasBeenPublished: hasBeenPublishedFlag
            }, targetId)

            const result = id
                ? await BlogModel.updatePost(id, saveDTO)
                : await BlogModel.createPost(saveDTO)

            res.json({success: true, post: result})
        } catch (error: any) {
            console.error('[AdminBlogController] Échec savePost :', error.message || error)
            res.status(500).json({error: "Erreur lors de la sauvegarde de l'article."})
        }
    }

    /**
     * Liste complète des articles pour la table d'administration (hors DELETED)
     * Cible : GET /api/admin/posts
     */
    static async fetchPosts(_req: Request, res: Response): Promise<void> {
        try {
            const posts = await BlogModel.fetchAllAdminPosts()
            res.json(BlogMapper.buildAdminPostList(posts))
        } catch (error: any) {
            console.error('[AdminBlogController] Erreur fetchPosts :', error.message || error)
            res.status(500).json({error: 'Impossible de récupérer les articles.'})
        }
    }

    /**
     * Soft delete d'un article (passage au statut DELETED)
     * Cible : DELETE /api/admin/posts/:id
     */
    static async deletePost(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            const existing = await BlogModel.fetchPostById(id)
            if (!existing) {
                res.status(404).json({error: 'Article introuvable.'})
                return
            }

            await BlogModel.softDeletePost(id)
            res.json({success: true})
        } catch (error: any) {
            console.error('[AdminBlogController] Échec deletePost :', error.message || error)
            res.status(500).json({error: 'Erreur lors de la suppression.'})
        }
    }

    /**
     * Inspection et audit des blocs d'images contenus dans les articles
     * Utilisé pour la maintenance et la détection d'orphelins
     * Cible : GET /api/admin/posts/contents-audit
     */
    static async fetchPostsContents(_req: Request, res: Response): Promise<void> {
        try {
            const rawPosts = await BlogModel.getPostsContents()
            const imageContents: any[] = []

            rawPosts.forEach((post) => {
                const blocks = Array.isArray(post.content) ? post.content : []
                blocks.forEach((block: any) => {
                    if (block.type === 'IMAGE') {
                        imageContents.push(block)
                    }
                    if (block.type === 'DOUBLE_CONTENT') {
                        if (block.left?.type === 'IMAGE') imageContents.push(block.left)
                        if (block.right?.type === 'IMAGE') imageContents.push(block.right)
                    }
                })
            })

            res.json({size: imageContents.length, data: imageContents})
        } catch (error: any) {
            console.error('[AdminBlogController] Erreur fetchPostsContents :', error.message || error)
            res.status(500).json({error: 'Erreur lors de la lecture des contenus.'})
        }
    }
}