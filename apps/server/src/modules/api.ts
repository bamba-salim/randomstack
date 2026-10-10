import {Router} from 'express'
import {AdminBlogRoutes} from './blog'
import {AdminTechnologyRoutes} from './stack'
import {AuthRoutes} from './user'

export default class WebService {
    static get routes(): Router {
        const router = Router()

        // 🛠️ Back-office Extranet (admin)
        router.use('/', AdminBlogRoutes.routes)
        router.use('/', AdminTechnologyRoutes.routes)
        router.use('/auth', AuthRoutes.routes)

        return router
    }
}