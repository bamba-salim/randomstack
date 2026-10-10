import { Router } from 'express'
import AdminTechnologyController from '../controllers/admin.technology.controller'
import { AuthMiddleware } from '#middlewares'

export default class AdminTechnologyRoutes {
    static get routes(): Router {
        const router = Router()

        // Middleware global pour tout le fichier
        router.use(AuthMiddleware.isAuthenticated, AuthMiddleware.permit('ADMIN', 'EDITOR'))

        router.get('/fetch-technology-init-form-data/:id?', AdminTechnologyController.fetchEditTechnologyInitialData)
        router.post('/save-technology/:id?', AdminTechnologyController.saveTechnology)
        router.get('/fetch-Technologies', AdminTechnologyController.fetchTechnologies)

        return router
    }
}