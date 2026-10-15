import {Router} from 'express'
import {
    AuthMiddleware,
    RateLimitMiddleware,
    SESSION_COOKIE,
    ValidateMiddleware
} from '#middlewares'
import {validateLogin, validateRegister, validateEditProfile} from '@randomstack/commons'
import {AuthController} from './user'

/**
 * Auth unique (cookie `rs.sid`) — client + extranet
 * Monté sur `/auth` (après SessionMiddleware.config)
 */
export default class Auth {
    static get routes(): Router {
        const router = Router()

        router.post(
            '/login',
            RateLimitMiddleware.auth,
            ValidateMiddleware.body(validateLogin),
            AuthController.login
        )
        router.post(
            '/register',
            RateLimitMiddleware.register,
            ValidateMiddleware.body(validateRegister),
            AuthController.register
        )

        router.get('/me', AuthMiddleware.isAuthenticated, AuthController.me)
        router.post(
            '/update-profile',
            AuthMiddleware.isAuthenticated,
            ValidateMiddleware.body(validateEditProfile),
            AuthController.updateProfile
        )
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

        router.post(
            '/login',
            RateLimitMiddleware.auth,
            ValidateMiddleware.body(validateLogin),
            AuthController.adminLogin
        )
        router.get('/me', AuthMiddleware.isAuthenticated, AuthController.me)
        router.post('/logout', AuthMiddleware.isAuthenticated, AuthController.logout(SESSION_COOKIE))

        return router
    }
}
