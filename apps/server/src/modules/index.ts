// apps/server/src/modules/index.tsxxx
import { Router } from 'express'
import { BlogRoutes, AdminBlogRoutes } from './blog'
import { FileRoutes } from './file'
// import { StackRoutes, AdminStackRoutes } from './stack'
// import { FileRoutes } from './file'

export default class AppRouter {
    static get routes(): Router {
        const router = Router()

        // 🌐 Front-office public
        router.use('/posts', BlogRoutes.routes)
        // router.use('/stacks', StackRoutes.routes)
        router.use('/files', FileRoutes.routes)

        // 🛠️ Back-office Extranet
        router.use('/admin/posts', AdminBlogRoutes.routes)
        // router.use('/admin/stacks', AdminStackRoutes.routes)

        return router
    }
}