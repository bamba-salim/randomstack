import {Router} from 'express'
import multer from 'multer'
import {TechnologyController} from '#controllers'
import {AuthMiddleware} from '#middlewares'

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024}
})

export default class AdminRoute {
    static get routes(): Router {
        const router = Router()

        // Route unique d'écriture RPC avec ID optionnel 🚀
        router.post(
            '/save-technology/:id?',
            AuthMiddleware.isAuthenticated,
            AuthMiddleware.permit('ADMIN', 'EDITOR'),
            upload.single('logo'),
            TechnologyController.saveTechnology
        )

        return router
    }
}