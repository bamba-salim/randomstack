import {Router} from 'express'
import {PostController} from '#controllers'

export default class PostRoute {
    static get routes(): Router {
        const router = Router()

        router.get(
            '/fetch-post/:slug',
            PostController.fetchPostBySlug
        )

        router.get(
            '/fetch-posts',
            PostController.fetchPosts
        )

        return router
    }
}