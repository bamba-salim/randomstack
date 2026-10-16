import type { Request, Response } from 'express'
import BlogModel from './blog.model'
import BlogMapper from './blog.mapper'
import BlogAction from './blog.action'
import FavoriteModel from './favorite.model'
import {UserModel} from '#user'

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
     * Lecture publique canonique par slug (`/tag/slug`).
     * Cible : GET /fetch-post/:slug
     */
    static async fetchPostBySlug(req: Request, res: Response): Promise<void> {
        try {
            const {slug} = req.params
            if (!slug) {
                res.status(400).json({error: 'Slug manquant.'})
                return
            }

            const post = await BlogModel.fetchPublishedPostBySlug(slug)
            if (!post) {
                res.status(404).json({error: 'Article introuvable.'})
                return
            }

            const profile = await UserModel.findProfileById(post.authorId)
            const author = profile ? BlogMapper.buildAuthorListed(profile) : null

            let isFavorite = false
            if (req.session?.userId) {
                isFavorite = await FavoriteModel.isFavorite(req.session.userId, post.id)
            }

            res.json(BlogMapper.buildPublicPostDetail(post, author, isFavorite))
        } catch (error: any) {
            console.error('[BlogController] Erreur fetchPostBySlug :', error.message || error)
            res.status(500).json({error: "Erreur lors de la récupération de l'article."})
        }
    }

    /**
     * Prévisualisation staff (brouillon / planifié / archivé).
     * Cible : GET /fetch-post-preview/:shareCode
     */
    static async fetchPostPreview(req: Request, res: Response): Promise<void> {
        try {
            const {shareCode} = req.params
            const role = req.session?.userRole
            const userId = req.session?.userId

            const staff = ['ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR']
            if (!userId || !role || !staff.includes(role)) {
                res.status(403).json({error: 'Prévisualisation réservée au staff.'})
                return
            }

            if (!shareCode) {
                res.status(400).json({error: 'Code article manquant.'})
                return
            }

            const post = await BlogModel.fetchPostByShareCode(shareCode)
            if (!post || post.status === 'DELETED') {
                res.status(404).json({error: 'Article introuvable.'})
                return
            }

            if (role === 'AUTHOR' && post.authorId !== userId) {
                res.status(403).json({error: 'Tu ne peux prévisualiser que tes articles.'})
                return
            }

            const profile = await UserModel.findProfileById(post.authorId)
            const author = profile ? BlogMapper.buildAuthorListed(profile) : null

            res.json(BlogMapper.buildPublicPostDetail(post, author, false, true))
        } catch (error: any) {
            console.error('[BlogController] Erreur fetchPostPreview :', error.message || error)
            res.status(500).json({error: 'Erreur lors de la prévisualisation.'})
        }
    }

    /**
     * Données de la page de partage `/post/:shareCode`.
     * Cible : GET /fetch-post-by-code/:shareCode
     */
    static async fetchPostByShareCode(req: Request, res: Response): Promise<void> {
        try {
            const {shareCode} = req.params
            if (!shareCode) {
                res.status(400).json({error: 'Code article manquant.'})
                return
            }

            const post = await BlogModel.fetchPublishedPostByShareCode(shareCode)
            if (!post) {
                res.status(404).json({error: 'Article introuvable.'})
                return
            }

            res.json(BlogMapper.buildPostShareResolved(post))
        } catch (error: any) {
            console.error('[BlogController] Erreur fetchPostByShareCode :', error.message || error)
            res.status(500).json({error: "Erreur lors de la résolution du lien de partage."})
        }
    }

    /**
     * Articles publiés du même auteur
     * Cible : GET /fetch-posts/author/:authorId
     */
    static async fetchPostsByAuthor(req: Request, res: Response): Promise<void> {
        try {
            const {authorId} = req.params
            const excludePostId = typeof req.query['exclude'] === 'string' ? req.query['exclude'] : undefined

            const posts = await BlogModel.fetchPublishedPostsByAuthor(authorId, excludePostId, 4)
            res.json(BlogMapper.buildPublicPostListedList(posts))
        } catch (error: any) {
            console.error('[BlogController] Erreur fetchPostsByAuthor :', error.message || error)
            res.status(500).json({error: "Erreur lors de la récupération des articles de l'auteur."})
        }
    }

    /**
     * Recommandations : articles similaires par tags (fallback récents)
     * Cible : GET /fetch-similar-posts/:slug
     */
    static async fetchSimilarPosts(req: Request, res: Response): Promise<void> {
        try {
            const {slug} = req.params

            const currentPost = await BlogModel.fetchPublishedPostBySlug(slug)
            if (!currentPost) {
                res.status(404).json({error: 'Article introuvable.'})
                return
            }

            const similarPosts = await BlogModel.fetchSimilarPosts(currentPost.id, currentPost.tags, 4)
            res.json(BlogMapper.buildPublicPostListedList(similarPosts))
        } catch (error: any) {
            console.error('[BlogController] Erreur fetchSimilarPosts :', error.message || error)
            res.status(500).json({error: 'Erreur lors de la récupération des articles similaires.'})
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