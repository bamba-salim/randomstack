import {Router} from 'express'

import {StackController, TechnologyController} from '#controllers'

export default class StackRoute {
    static get routes(): Router {
        const router = Router()

        router.get('/history', StackController.getHistory)

        router.post('/draw-stack', StackController.draw)
        router.get('/fetch-history', StackController.getHistory)
        router.get('/fetch-technologies', TechnologyController.getAll)
        router.get('/fetch-technology/:id', TechnologyController.getById)

        router.post('/save-share', StackController.saveShare)
        router.get('/fetch-share/:code', StackController.fetchShare)

        return router
    }
}