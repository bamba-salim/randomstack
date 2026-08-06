import { Router } from 'express'
import StackRoute from './core/stack.route'
import AuthRoute from './core/auth.route'
import AdminRoute from './core/admin.route'

export default class AppRouter {
    static get routes(): Router {
        const router = Router()

        // Routage sémantique
        router.use('/', StackRoute.routes)
        router.use('/auth', AuthRoute.routes)
        router.use('/admin', AdminRoute.routes)

        return router
    }
}