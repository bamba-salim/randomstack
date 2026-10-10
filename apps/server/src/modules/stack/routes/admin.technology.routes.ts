import { Router } from 'express'
import TechnologyController from '../controllers/technology.controller'

export default class TechnologyRoutes {
    static get routes(): Router {
        const router = Router()

        router.get('/', TechnologyController.fetchTechnologies)
        router.get('/:slug', TechnologyController.fetchTechnologyBySlug)

        return router
    }
}