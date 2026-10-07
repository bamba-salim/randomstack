import {Router} from 'express'
import FileController from './file.controller.js'

export default class FileRoutes {
    static get routes(): Router {
        const router = Router()

        // Route publique : GET /api/files/:id 🚀
        router.get('/:id', FileController.getFile)

        return router
    }
}