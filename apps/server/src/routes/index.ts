import { Router } from 'express'
import StackRoute from './core/stack.route.js'
import AuthRoute from './core/auth.route.js'

export default class AppRouter {
    static get routes(): Router {
        const router = Router()

        // Routage sémantique
        router.use('/', StackRoute.routes)        // Expose: /draw, /history, /technologies
        router.use('/auth', AuthRoute.routes)    // Expose: /auth/login, /auth/me, /auth/logout

        return router
    }
}