import type {Request, Response} from 'express'
import crypto from 'crypto'
import {FileAction} from '#file'

import BlogModel from './blog.model'
import BlogMapper from './blog.mapper'

import type {EditPostFormBean} from '@randomstack/commons'

type SessionInfo = {userId?: string; userRole?: string}

export default class AdminBlogController {

    private static session(req: Request): SessionInfo {
        const session = (req as any).session
        return {
            userId: session?.userId,
            userRole: session?.userRole
        }
    }

    /** Lecture : AUTHOR = ses articles ; EDITOR / MODERATOR / ADMIN = tous */
    private static canReadPost(session: SessionInfo, authorId: string | null | undefined): boolean {
        if (!session.userId) return false
        if (session.userRole === 'ADMIN' || session.userRole === 'EDITOR' || session.userRole === 'MODERATOR') {
            return true
        }
        if (session.userRole === 'AUTHOR') return authorId === session.userId
        return false
    }

    /** Écriture : AUTHOR = ses articles ; EDITOR / ADMIN = tous ; MODERATOR = non */
    private static canWritePost(session: SessionInfo, authorId: string | null | undefined): boolean {
        if (!session.userId) return false
        if (session.userRole === 'ADMIN' || session.userRole === 'EDITOR') return true
        if (session.userRole === 'AUTHOR') return authorId === session.userId
        return false
    }

    private static canFeature(session: SessionInfo): boolean {
        return session.userRole === 'ADMIN' || session.userRole === 'EDITOR'
    }

    /**
     * Initialisation du formulaire Extranet (FormBean)
     * Cible : GET /ws/fetch-post-form-data / GET /ws/fetch-post-form-data/:id
     */
    static async fetchEditPostInitialData(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            const session = AdminBlogController.session(req)
            let formBean = BlogMapper.getInitialFormBean()

            if (id) {
                const post = await BlogModel.fetchPostById(id)
                if (!post) {
                    res.status(404).json({error: 'Article introuvable.'})
                    return
                }
                if (!AdminBlogController.canReadPost(session, post.authorId)) {
                    res.status(403).json({error: 'Accès refusé à cet article.'})
                    return
                }
                formBean = BlogMapper.fromDBToClientFormBean(post)
            } else {
                if (session.userRole === 'MODERATOR') {
                    res.status(403).json({error: 'Un modérateur ne peut pas créer d’article.'})
                    return
                }
                formBean.authorId = session.userId || null
            }

            res.json(formBean)
        } catch (error: any) {
            console.error('[AdminBlogController] Erreur fetchEditPostInitialData :', error.message || error)
            res.status(500).json({error: "Erreur lors de l'initialisation du formulaire."})
        }
    }

    /**
     * Sauvegarde d'un article (Création ou Édition)
     * - AUTHOR : ses articles, pas d'à la une, pas de changement d'auteur
     * - EDITOR : tous, à la une exclusive, pas de changement d'auteur
     * - ADMIN : tous + auteur + à la une
     */
    static async savePost(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            const targetId = id || crypto.randomUUID()
            const formBean = req.body as EditPostFormBean
            const session = AdminBlogController.session(req)
            const sessionUserId = session.userId
            const isAdmin = session.userRole === 'ADMIN'

            if (!sessionUserId) {
                res.status(401).json({error: 'Session requise.'})
                return
            }

            const {status: reqStatus} = formBean
            let finalStatus = reqStatus
            let hasBeenPublishedFlag = formBean.hasBeenPublished || false
            let authorId: string | null = sessionUserId
            let existingPost: Awaited<ReturnType<typeof BlogModel.fetchPostById>> | null = null

            if (id) {
                existingPost = await BlogModel.fetchPostById(id)
                if (!existingPost) {
                    res.status(404).json({error: 'Article introuvable.'})
                    return
                }

                if (!AdminBlogController.canWritePost(session, existingPost.authorId)) {
                    res.status(403).json({error: 'Accès refusé à cet article.'})
                    return
                }

                hasBeenPublishedFlag = existingPost.hasBeenPublished
                authorId = existingPost.authorId || sessionUserId

                if (isAdmin && formBean.authorId) {
                    authorId = formBean.authorId
                }

                if (existingPost.imageId && existingPost.imageId !== formBean.imageId) {
                    await FileAction.delete(existingPost.imageId).catch((err) =>
                        console.warn('[AdminBlogController] Échec suppression ancienne image :', err)
                    )
                }

                if (hasBeenPublishedFlag && reqStatus === 'SCHEDULED') {
                    res.status(400).json({error: 'Un article déjà publié ne peut plus être planifié.'})
                    return
                }

                if (existingPost.status === 'PUBLISHED' && reqStatus !== 'PUBLISHED') {
                    finalStatus = 'DRAFT'
                }
            } else {
                if (!AdminBlogController.canWritePost(session, sessionUserId)) {
                    res.status(403).json({error: 'Accès refusé.'})
                    return
                }
                if (isAdmin && formBean.authorId) {
                    authorId = formBean.authorId
                }
            }

            // À la une : EDITOR + ADMIN uniquement ; sinon on conserve l'existant
            if (!AdminBlogController.canFeature(session)) {
                formBean.isFeatured = existingPost ? Boolean(existingPost.isFeatured) : false
            }

            if (finalStatus === 'PUBLISHED') {
                hasBeenPublishedFlag = true
            }

            // shareCode figé à vie ; slug éditable (unicité vérifiée)
            const saveDTO = BlogMapper.toSavePostDTO(
                {
                    ...formBean,
                    status: finalStatus,
                    hasBeenPublished: hasBeenPublishedFlag
                },
                targetId,
                authorId,
                existingPost?.shareCode
            )

            const slugTaken = await BlogModel.isSlugTaken(saveDTO.post.slug, id || undefined)
            if (slugTaken) {
                res.status(409).json({error: 'Ce slug est déjà utilisé par un autre article.'})
                return
            }

            const result = id
                ? await BlogModel.updatePost(id, saveDTO)
                : await BlogModel.createPost(saveDTO)

            if (formBean.isFeatured) {
                await BlogModel.clearOtherFeatured(result.id)
            }

            res.json(BlogMapper.buildSavePostResponse(result))
        } catch (error: any) {
            console.error('[AdminBlogController] Échec savePost :', error.message || error)
            if (error?.code === 'P2002') {
                res.status(409).json({error: 'Ce slug est déjà utilisé par un autre article.'})
                return
            }
            res.status(500).json({error: "Erreur lors de la sauvegarde de l'article."})
        }
    }

    /**
     * Liste articles admin — AUTHOR : les siens ; EDITOR / MODERATOR / ADMIN : tous
     */
    static async fetchPosts(req: Request, res: Response): Promise<void> {
        try {
            const session = AdminBlogController.session(req)
            const authorFilter = session.userRole === 'AUTHOR' ? session.userId : undefined
            const posts = await BlogModel.fetchAllAdminPosts(authorFilter)
            res.json(BlogMapper.buildAdminPostListedList(posts))
        } catch (error: any) {
            console.error('[AdminBlogController] Erreur fetchPosts :', error.message || error)
            res.status(500).json({error: 'Impossible de récupérer les articles.'})
        }
    }

    static async deletePost(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            const session = AdminBlogController.session(req)
            const existing = await BlogModel.fetchPostById(id)
            if (!existing) {
                res.status(404).json({error: 'Article introuvable.'})
                return
            }

            if (!AdminBlogController.canWritePost(session, existing.authorId)) {
                res.status(403).json({error: 'Accès refusé à cet article.'})
                return
            }

            await BlogModel.softDeletePost(id)
            res.json(BlogMapper.buildSuccessAck())
        } catch (error: any) {
            console.error('[AdminBlogController] Échec deletePost :', error.message || error)
            res.status(500).json({error: 'Erreur lors de la suppression.'})
        }
    }

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

            res.json(BlogMapper.buildPostsContentsAudit(imageContents))
        } catch (error: any) {
            console.error('[AdminBlogController] Erreur fetchPostsContents :', error.message || error)
            res.status(500).json({error: 'Erreur lors de la lecture des contenus.'})
        }
    }
}
