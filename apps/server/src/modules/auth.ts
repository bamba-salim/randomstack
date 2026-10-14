import {Router} from 'express'
import {AuthMiddleware, RateLimitMiddleware, SESSION_COOKIE} from '#middlewares'
import {AuthController} from './user'

/**
 * Auth unique (cookie `rs.sid`) — client + extranet
 * Monté sur `/auth` (après SessionMiddleware.config)
 */
export default class Auth {
    static get routes(): Router {
        const router = Router()

        router.post('/login', RateLimitMiddleware.auth, AuthController.login)
        router.post('/register', RateLimitMiddleware.register, AuthController.register)

        router.get('/me', AuthMiddleware.isAuthenticated, AuthController.me)
        router.post('/update-profile', AuthMiddleware.isAuthenticated, AuthController.updateProfile)
        router.post('/logout', AuthMiddleware.isAuthenticated, AuthController.logout(SESSION_COOKIE))

        return router
    }
}

/**
 * Auth extranet — même cookie, login restreint aux rôles staff
 * Monté sur `/auth/admin`
 */
export class AdminAuth {
    static get routes(): Router {
        const router = Router()

        router.post('/login', RateLimitMiddleware.auth, AuthController.adminLogin)
        router.get('/me', AuthMiddleware.isAuthenticated, AuthController.me)
        router.post('/logout', AuthMiddleware.isAuthenticated, AuthController.logout(SESSION_COOKIE))

        return router
    }
}
