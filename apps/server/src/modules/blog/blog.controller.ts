import type { Request, Response } from 'express'
import BlogModel from './blog.model'
import BlogMapper from './blog.mapper'
import BlogAction from './blog.action'

export default class BlogController {

    /**
     * Flux d'articles principal (Home & Blog)
     * Règle 10 : Résout le featured post (48h) et l'exclut de la liste inférieure
     * Cible : GET /api/posts
     */
    static async fetchPublishedPosts(_req: Request, res: Response): Promise<void> {
        try {
            // 1. Résolution de l'article à la une avec la règle des 48h
            const featuredPost = await BlogAction.resolveFeaturedPost()
            const excludeId = featuredPost?.id

            // 2. Récupération des autres articles (déduplication garantie)
            const otherPosts = await BlogModel.fetchPublishedPosts(excludeId)

            res.json(BlogMapper.buildPublishedPostsResponse(featuredPost, otherPosts))
        } catch (error: any) {
            console.error('[BlogController] Erreur fetchPublishedPosts :', error.message || error)
            res.status(500).json({ error: 'Erreur lors du chargement des articles.' })
        }
    }

    /**
     * Flux d'articles filtré par tag
     * Cible : GET /api/posts/tag/:tag
     */
    static async fetchPostsByTag(req: Request, res: Response): Promise<void> {
        try {
            const { tag } = req.params

            // 1. Résolution de l'article à la une pour ce tag
            const featuredPost = await BlogAction.resolveFeaturedPostByTag(tag)
            const excludeId = featuredPost?.id

            // 2. Liste des autres articles avec ce tag
            const otherPosts = await BlogModel.fetchPublishedPostsByTag(tag, excludeId)

            res.json(BlogMapper.buildPublishedPostsResponse(featuredPost, otherPosts))
        } catch (error: any) {
            console.error('[BlogController] Erreur fetchPostsByTag :', error.message || error)
            res.status(500).json({ error: 'Erreur lors du chargement des articles par tag.' })
        }
    }

    /**
     * Lecture d'un article spécifique par son slug
     * Barrière de sécurité : 404 si non publié, sauf si admin connecté en mode preview
     * Cible : GET /api/posts/:slug
     */
    static async fetchPostBySlug(req: Request, res: Response): Promise<void> {
        try {
            const { slug } = req.params
            const isPreview = req.query['preview'] === 'true'

            const post = await BlogModel.fetchPostBySlug(slug)
            if (!post) {
                res.status(404).json({ error: 'Article introuvable.' })
                return
            }

            // Barrière de sécurité Preview / Statut
            const session = (req as any).session
            const isAuthorizedAdmin = session?.userId && ['ADMIN', 'EDITOR', 'MODERATOR'].includes(session.userRole)

            if (post.status !== 'PUBLISHED' && (!isPreview || !isAuthorizedAdmin)) {
                res.status(404).json({ error: 'Article introuvable.' })
                return
            }

            res.json(BlogMapper.buildPublicPostDetail(post))
        } catch (error: any) {
            console.error('[BlogController] Erreur fetchPostBySlug :', error.message || error)
            res.status(500).json({ error: "Erreur lors de la récupération de l'article." })
        }
    }

    /**
     * Recommandations : Articles similaires par tags partagés (avec fallback sur les récents)
     * Cible : GET /api/posts/:slug/similar
     */
    static async fetchSimilarPosts(req: Request, res: Response): Promise<void> {
        try {
            const { slug } = req.params

            // 1. Récupère l'article de référence
            const currentPost = await BlogModel.fetchPublishedPostBySlug(slug)
            if (!currentPost) {
                res.status(404).json({ error: 'Article introuvable.' })
                return
            }

            // 2. Algorithme des 3 articles similaires
            const similarPosts = await BlogModel.fetchSimilarPosts(currentPost.id, currentPost.tags, 3)

            // 3. Transformation en PublicPostListed pour le client
            res.json(BlogMapper.buildPublicPostListedList(similarPosts))
        } catch (error: any) {
            console.error('[BlogController] Erreur fetchSimilarPosts :', error.message || error)
            res.status(500).json({ error: 'Erreur lors de la récupération des articles similaires.' })
        }
    }

    /**
     * Liste des tags uniques existants pour les filtres et badges
     * Cible : GET /api/posts/tags
     */
    static async fetchUniqueTags(_req: Request, res: Response): Promise<void> {
        try {
            const tags = await BlogModel.fetchUniqueTags()
            res.json(BlogMapper.buildUniqueTags(tags))
        } catch (error: any) {
            console.error('[BlogController] Erreur fetchUniqueTags :', error.message || error)
            res.status(500).json({ error: 'Erreur lors de la récupération des tags.' })
        }
    }
}