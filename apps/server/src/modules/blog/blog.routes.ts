import { Router } from 'express'
import BlogController from './blog.controller'

export default class BlogRoutes {
    static get routes(): Router {
        const router = Router()

        // 1. Flux principal (Home & Blog)
        router.get('/fetch-posts', BlogController.fetchPublishedPosts)

        // 2. Flux filtré par tag
        router.get('/fetch-posts/tag/:tag', BlogController.fetchPostsByTag)

        // 3. Liste des tags uniques pour les badges/filtres
        router.get('/fetch-tags', BlogController.fetchUniqueTags)

        // 4. Articles similaires / recommandés 🚀
        router.get('/fetch-similar-posts/:slug', BlogController.fetchSimilarPosts)

        // 5. Lecture d'un article par slug (placé en dernier pour ne pas masquer les routes statiques)
        router.get('/fetch-post/:slug', BlogController.fetchPostBySlug)

        return router
    }
}