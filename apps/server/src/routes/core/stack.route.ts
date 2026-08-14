import {Router} from 'express'

import {StackController, TechnologyController} from '#controllers'

export default class StackRoute {
    static get routes(): Router {
        const router = Router()

        router.post('/draw-stack', StackController.draw)
        router.get('/fetch-history', StackController.getHistory)
        router.get('/fetch-technologies', TechnologyController.fetchTechnologies)
        router.get('/fetch-technology/:id', TechnologyController.fetchTechnologyById)
        router.get('/fetch-technology-by-slug/:slug', TechnologyController.fetchTechnologyBySlug) // <-- Cible le Slug 🚀

        router.post('/save-share', StackController.saveShare)
        router.get('/fetch-share/:code', StackController.fetchShare)

        return router
    }
}