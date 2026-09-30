import {Router} from 'express'
import {PostController as old} from '#controllers'
import {PostController} from '#modules'

export default class PostRoute {
    static get routes(): Router {
        const router = Router()

        router.get('/fetch-post/:slug', old.fetchPostBySlug)
        router.get('/fetch-posts', old.fetchPublishedPosts)
        router.get('/fetch-posts/tag/:tag', PostController.fetchPostsByTag)

        return router
    }
}