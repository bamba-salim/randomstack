import {Router} from 'express'
import {AuthMiddleware} from '#middlewares'
import {BlogController, CommentController} from './blog'
import {FileController} from './file'
import {StackController, TechnologyController} from './stack'
import multer from 'multer'


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024}
})

/**
 * Routes publiques (front-office client) — à plat, sans sous-préfixe.
 * Monté sur `/` dans index.ts
 */
export default class WebService {
    static get routes(): Router {
        const router = Router()

        // Stack / tirage
        router.post('/draw-stack', StackController.draw)
        router.get('/fetch-draw-history', StackController.getHistory)
        router.get('/fetch-draw-technologies', StackController.fetchDrawActiveTechnologies)
        router.post('/save-share', StackController.saveShare)
        router.get('/fetch-share/:code', StackController.fetchShare)

        // Technologies (encyclopédie)
        router.get('/fetch-technologies', TechnologyController.fetchTechnologies)
        router.get('/fetch-technology-by-slug/:slug', TechnologyController.fetchTechnologyBySlug)

        // Blog
        router.get('/fetch-posts', BlogController.fetchPublishedPosts)
        router.get('/fetch-posts/tag/:tag', BlogController.fetchPostsByTag)
        router.get('/fetch-posts/author/:authorId', BlogController.fetchPostsByAuthor)
        router.get('/fetch-tags', BlogController.fetchUniqueTags)
        router.get('/fetch-similar-posts/:slug', BlogController.fetchSimilarPosts)
        router.get('/fetch-post/:slug', BlogController.fetchPostBySlug)

        // Commentaires
        router.get('/fetch-comments/:postId', CommentController.fetchComments)
        router.post(
            '/create-comment',
            AuthMiddleware.isAuthenticated,
            CommentController.createComment
        )
        router.post(
            '/vote-comment/:id',
            AuthMiddleware.isAuthenticated,
            CommentController.voteComment
        )
        router.delete(
            '/delete-comment/:id',
            AuthMiddleware.isAuthenticated,
            CommentController.deleteComment
        )

        // Fichiers
        router.get('/files/:id', FileController.getFile)
        router.post('/upload-file', upload.single('file'), FileController.upload)

        return router
    }
}
