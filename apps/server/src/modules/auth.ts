import {Router} from 'express'
import {AuthMiddleware} from '#middlewares'
import {AuthController} from './user'

/**
 * Routes auth — à plat, même pattern que WebService / Api.
 * Monté sur `/auth` dans index.ts
 */
export default class Auth {
    static get routes(): Router {
        const router = Router()

        router.post('/login', AuthController.login)
        router.post('/admin/login', AuthController.adminLogin)

        router.get('/me', AuthMiddleware.isAuthenticated, AuthController.me)
        router.post('/logout', AuthMiddleware.isAuthenticated, AuthController.logout)

        return router
    }
}
