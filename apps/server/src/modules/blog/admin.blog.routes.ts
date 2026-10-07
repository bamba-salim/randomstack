import { Router } from 'express'
import { AuthMiddleware } from '#middlewares'

import AdminBlogController from './admin.blog.controller'
import BlogController from './blog.controller'


export default class AdminBlogRoutes {
    static get routes(): Router {
        const router = Router()

        // 1. Liste de tous les articles pour la table d'administration
        router.get(
            '/fetch-posts',
            AuthMiddleware.isAuthenticated,
            AuthMiddleware.permit('ADMIN', 'EDITOR'),
            AdminBlogController.fetchPosts
        )

        // 2. Initialisation du FormBean (création ou édition)
        router.get(
            '/fetch-post-form-data/:id?',
            AuthMiddleware.isAuthenticated,
            AuthMiddleware.permit('ADMIN', 'EDITOR'),
            AdminBlogController.fetchEditPostInitialData
        )

        // 3. Sauvegarde (création ou mise à jour)
        router.post(
            '/save-post/:id?',
            AuthMiddleware.isAuthenticated,
            AuthMiddleware.permit('ADMIN', 'EDITOR'),
            AdminBlogController.savePost
        )

        // 4. Suppression (Soft Delete) 🚀
        router.delete(
            '/delete-post/:id',
            AuthMiddleware.isAuthenticated,
            AuthMiddleware.permit('ADMIN', 'EDITOR'),
            AdminBlogController.deletePost
        )

        // 5. Audit de contenu (détection des blocs images)
        router.get(
            '/fetch-posts-contents',
            AuthMiddleware.isAuthenticated,
            AuthMiddleware.permit('ADMIN', 'EDITOR'),
            AdminBlogController.fetchPostsContents
        )

        // 6. Liste des tags pour l'autocomplétion de l'éditeur
        router.get(
            '/fetch-tags',
            AuthMiddleware.isAuthenticated,
            AuthMiddleware.permit('ADMIN', 'EDITOR'),
            BlogController.fetchUniqueTags
        )

        return router
    }
}