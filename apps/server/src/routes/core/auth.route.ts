import { Router } from 'express'
import { AuthController } from '#controllers'
import { AuthMiddleware } from '#middlewares'

export default class AuthRoute {
    static get routes(): Router {
        const router = Router()

        router.post('/login', AuthController.login)               // Public Login
        router.post('/admin/login', AuthController.adminLogin)     // Admin Extranet Login 🚀

        router.get('/me', AuthMiddleware.isAuthenticated, AuthController.me)
        router.post('/logout', AuthMiddleware.isAuthenticated, AuthController.logout)

        return router
    }
}