import {Router} from 'express'
import multer from 'multer'
import {TechnologyController, AdminPostController} from '#controllers'
import {AuthMiddleware} from '#middlewares'

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024}
})

export default class AdminRoute {
    static get routes(): Router {
        const router = Router()

        router.post(
            '/save-technology/:id?',
            AuthMiddleware.isAuthenticated, AuthMiddleware.permit('ADMIN', 'EDITOR'),
            upload.single('logo'),
            TechnologyController.saveTechnology
        )

        router.get(
            '/fetch-technology-form-data/:id?',
            AuthMiddleware.isAuthenticated, AuthMiddleware.permit('ADMIN', 'EDITOR'),
            TechnologyController.fetchEditTechnologyInitialData
        )


        router.get(
            '/fetch-post-form-data/:id?',
            AuthMiddleware.isAuthenticated, AuthMiddleware.permit('ADMIN', 'EDITOR'),
            AdminPostController.fetchEditPostInitialData
        )

        router.get(
            '/fetch-posts',
            AuthMiddleware.isAuthenticated, AuthMiddleware.permit('ADMIN', 'EDITOR'),
            AdminPostController.fetchPosts
        )

        router.post(
            '/save-post/:id?',
            AuthMiddleware.isAuthenticated, AuthMiddleware.permit('ADMIN', 'EDITOR'),
            upload.single('logo'),
            AdminPostController.savePost
        )


        return router
    }
}