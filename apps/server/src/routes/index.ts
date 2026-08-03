import { Router } from 'express'
import StackRoute from './core/stack.route'
import AuthRoute from './core/auth.route'
import AdminRoute from './core/admin.route'

export default class AppRouter {
    static get routes(): Router {
        const router = Router()

        // Routage sémantique
        router.use('/', StackRoute.routes)        // Expose: /draw, /history, /technologies
        router.use('/auth', AuthRoute.routes)    // Expose: /auth/login, /auth/me, /auth/logout
        router.use('/admin', AdminRoute.routes)

        return router
    }
}