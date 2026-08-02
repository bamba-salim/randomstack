import {Router} from 'express'

import {StackController} from '#controllers'

export default class StackRoute {
    static get routes(): Router {
        const router = Router()

        router.post('/draw', StackController.draw)
        router.get('/history', StackController.getHistory)
        router.get('/technologies', StackController.fetchTechnologies)

        return router
    }
}