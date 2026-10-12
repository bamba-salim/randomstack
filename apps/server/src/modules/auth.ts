import {Router} from 'express'
import {AuthMiddleware, CLIENT_SESSION_COOKIE, ADMIN_SESSION_COOKIE} from '#middlewares'
import {AuthController} from './user'

/**
 * Auth site public — cookie `rs.client.sid`
 * Monté sur `/auth` (après SessionMiddleware.client)
 */
export default class Auth {
    static get routes(): Router {
        const router = Router()

        router.post('/login', AuthController.login)
        router.post('/register', AuthController.register)

        router.get('/me', AuthMiddleware.isAuthenticated, AuthController.me)
        router.post('/update-profile', AuthMiddleware.isAuthenticated, AuthController.updateProfile)
        router.post('/logout', AuthMiddleware.isAuthenticated, AuthController.logout(CLIENT_SESSION_COOKIE))

        return router
    }
}

/**
 * Auth extranet — cookie `rs.admin.sid`
 * Monté sur `/auth/admin` (après SessionMiddleware.admin)
 */
export class AdminAuth {
    static get routes(): Router {
        const router = Router()

        router.post('/login', AuthController.adminLogin)
        router.get('/me', AuthMiddleware.isAuthenticated, AuthController.me)
        router.post('/logout', AuthMiddleware.isAuthenticated, AuthController.logout(ADMIN_SESSION_COOKIE))

        return router
    }
}
