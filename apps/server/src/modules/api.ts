import {Router} from 'express'
import {AuthMiddleware} from '#middlewares'
import {AdminBlogController, BlogController} from './blog'
import {AdminTechnologyController} from './stack'

/**
 * Routes admin (extranet) — à plat, sans sous-préfixe.
 * Monté sur `/ws` dans index.ts
 */
export default class Api {
    static get routes(): Router {
        const router = Router()

        router.use(AuthMiddleware.isAuthenticated, AuthMiddleware.permit('ADMIN', 'EDITOR'))

        // Technologies
        router.get('/fetch-technologies', AdminTechnologyController.fetchTechnologies)
        router.get('/fetch-technology-init-form-data/:id?', AdminTechnologyController.fetchEditTechnologyInitialData)
        router.post('/save-technology/:id?', AdminTechnologyController.saveTechnology)

        // Blog
        router.get('/fetch-posts', AdminBlogController.fetchPosts)
        router.get('/fetch-post-form-data/:id?', AdminBlogController.fetchEditPostInitialData)
        router.post('/save-post/:id?', AdminBlogController.savePost)
        router.delete('/delete-post/:id', AdminBlogController.deletePost)
        router.get('/fetch-posts-contents', AdminBlogController.fetchPostsContents)
        router.get('/fetch-tags', BlogController.fetchUniqueTags)

        return router
    }
}
