import { Router } from 'express'
import { FileController } from '#controllers'

export default class FileRoute {
    static get routes(): Router {
        const router = Router()

        // Route publique : GET /api/files/:id 🚀
        router.get('/:id', FileController.getFile)

        return router
    }
}