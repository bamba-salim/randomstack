import {Router} from 'express'
import {AuthMiddleware, RateLimitMiddleware, ValidateMiddleware} from '#middlewares'
import {
    validateSavePost,
    validatePostId,
    validateSaveTechnology,
    validateCreateUser,
    validateUpdateUserRole
} from '@randomstack/commons'
import {AdminBlogController, BlogController} from '#blog'
import {AdminTechnologyController} from '#stack'
import {AdminUserController} from '#user'

/**
 * Routes admin (extranet) — à plat, sans sous-préfixe.
 * Monté sur `/ws` dans index.ts
 *
 * Hiérarchie :
 * - ADMIN : tous les droits
 * - EDITOR : tous articles, à la une, technologies, consultation auteurs (+ leurs articles)
 * - AUTHOR : ses articles uniquement
 * - MODERATOR : users (USER↔AUTHOR) + articles en lecture seule
 */
export default class Api {
    static get routes(): Router {
        const router = Router()

        router.use(AuthMiddleware.isAuthenticated)

        // Blog — lecture
        router.get(
            '/fetch-posts',
            AuthMiddleware.permit('ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR'),
            AdminBlogController.fetchPosts
        )
        router.get(
            '/fetch-post-form-data/:id?',
            AuthMiddleware.permit('ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR'),
            AdminBlogController.fetchEditPostInitialData
        )
        router.get(
            '/fetch-tags',
            AuthMiddleware.permit('ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR'),
            BlogController.fetchUniqueTags
        )

        // Blog — écriture (pas MODERATOR)
        router.post(
            '/save-post/:id?',
            AuthMiddleware.permit('ADMIN', 'EDITOR', 'AUTHOR'),
            RateLimitMiddleware.savePost,
            ValidateMiddleware.body(validateSavePost),
            AdminBlogController.savePost
        )
        router.delete(
            '/delete-post/:id',
            AuthMiddleware.permit('ADMIN', 'EDITOR', 'AUTHOR'),
            ValidateMiddleware.params(validatePostId),
            AdminBlogController.deletePost
        )
        router.delete(
            '/purge-post/:id',
            AuthMiddleware.permit('ADMIN'),
            ValidateMiddleware.params(validatePostId),
            AdminBlogController.purgePost
        )
        router.get(
            '/fetch-posts-contents',
            AuthMiddleware.permit('ADMIN'),
            AdminBlogController.fetchPostsContents
        )

        // Technologies — ADMIN + EDITOR
        router.get(
            '/fetch-technologies',
            AuthMiddleware.permit('ADMIN', 'EDITOR'),
            AdminTechnologyController.fetchTechnologies
        )
        router.get(
            '/fetch-technology-init-form-data/:id?',
            AuthMiddleware.permit('ADMIN', 'EDITOR'),
            AdminTechnologyController.fetchEditTechnologyInitialData
        )
        router.post(
            '/save-technology/:id?',
            AuthMiddleware.permit('ADMIN', 'EDITOR'),
            ValidateMiddleware.body(validateSaveTechnology),
            AdminTechnologyController.saveTechnology
        )

        // Auteurs (réassignation article) — ADMIN
        router.get(
            '/fetch-editorial-authors',
            AuthMiddleware.permit('ADMIN'),
            AdminUserController.fetchEditorialAuthors
        )

        // Utilisateurs — ADMIN + MODERATOR ; EDITOR : auteurs seulement (filtre controller)
        router.get(
            '/fetch-users',
            AuthMiddleware.permit('ADMIN', 'MODERATOR', 'EDITOR'),
            AdminUserController.fetchUsers
        )
        router.get(
            '/fetch-user/:id',
            AuthMiddleware.permit('ADMIN', 'MODERATOR', 'EDITOR'),
            AdminUserController.fetchUserById
        )
        router.post(
            '/update-user-role/:id',
            AuthMiddleware.permit('ADMIN', 'MODERATOR'),
            ValidateMiddleware.body(validateUpdateUserRole),
            AdminUserController.updateUserRole
        )
        router.post(
            '/create-user',
            AuthMiddleware.permit('ADMIN'),
            ValidateMiddleware.body(validateCreateUser),
            AdminUserController.createUser
        )

        return router
    }
}
