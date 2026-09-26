import type {Request, Response} from 'express'
import {PostModel} from '#models'
import {PostAction} from '#action-support'
import {PostMapper} from '#modules'

export default class PostController {
    // Récupérer un article spécifique (avec barrière de prévisualisation sécurisée) 🔒
    static async fetchPostBySlug(req: Request, res: Response): Promise<void> {
        try {
            const {slug} = req.params
            const isPreview = req.query['preview'] === 'true'

            const post = await PostModel.fetchPostBySlug(slug)
            if (!post) {
                res.status(404).json({error: 'Article introuvable.'})
                return
            }

            // Barrière de sécurité : Si l'article n'est pas publié et que l'appelant n'est pas Admin/Editeur connecté, on renvoie une 404 🔒
            const session = req.session as any
            const isAuthorizedAdmin = session?.userId && ['ADMIN', 'EDITOR', 'MODERATOR'].includes(session.userRole)

            if (post.status !== 'PUBLISHED' && (!isPreview || !isAuthorizedAdmin)) {
                res.status(404).json({error: 'Article introuvable.'})
                return
            }

            res.json(post)
        } catch {
            res.status(500).json({error: "Erreur lors de la récupération de l'article."})
        }
    }

    static async fetchPosts(req: Request, res: Response): Promise<void> {
        try {
            const posts = await PostModel.fetchPublishedPost()
            res.json(posts)
        } catch {
            res.status(500).json({error: "Erreur lors de la récupération des articles."})
        }

    }

    static async fetchPublishedPosts(_req: Request, res: Response): Promise<void> {
        try {
            // Étape A : L'Action Support résout l'article à la une (gère la règle des 48h)
            const featuredPost = await PostAction.resolveFeaturedPost()

            // Étape B : On récupère l'ID du vainqueur pour l'exclure de la liste suivante (éviter les doublons)
            const excludeId = featuredPost?.id

            // Étape C : On récupère tout le reste du flux via le Modèle
            const otherPosts = await PostModel.fetchPublishedPosts(excludeId)

            // Étape D : On renvoie la structure propre au client Front-end 🚀
            res.json({
                featured: PostMapper.buildFeaturedPost(featuredPost),
                posts: PostMapper.buildListedPostList(otherPosts)
            })
        } catch (error: any) {
            console.error("[PostController] Erreur fetchPublishedPosts :", error.message || error)
            res.status(500).json({ error: 'Erreur lors du chargement des articles.' })
        }
    }
}