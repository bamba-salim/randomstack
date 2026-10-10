import {Router} from 'express'
import {BlogRoutes} from './blog'
import {FileRoutes} from './file'
import {AuthRoutes} from './user'
import {StackRoutes, TechnologyRoutes} from './stack'

export default class AppRouter {
    static get routes(): Router {
        const router = Router()

        // 🌐 Front-office public
        router.use('/blog', BlogRoutes.routes)
        router.use('/stacks', StackRoutes.routes)
        router.use('/files', FileRoutes.routes)
        router.use('/technologies', TechnologyRoutes.routes)
        router.use('/auth', AuthRoutes.routes)

        return router
    }
}