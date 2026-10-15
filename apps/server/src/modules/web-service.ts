import {Router} from 'express'
import {AuthMiddleware, RateLimitMiddleware, ValidateMiddleware} from '#middlewares'
import {validateCreateComment, validateVoteComment} from '@randomstack/commons'
import {BlogController, CommentController, FavoriteController} from '#blog'
import {FileController} from '#file'
import {StackController, TechnologyController} from '#stack'
import {AuthController} from '#user'
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

        // Profils publics
        router.get('/fetch-profile/:id', AuthController.fetchPublicProfile)

        // Blog
        router.get('/fetch-posts', BlogController.fetchPublishedPosts)
        router.get('/fetch-posts/tag/:tag', BlogController.fetchPostsByTag)
        router.get('/fetch-posts/author/:authorId', BlogController.fetchPostsByAuthor)
        router.get('/fetch-tags', BlogController.fetchUniqueTags)
        router.get('/fetch-similar-posts/:slug', BlogController.fetchSimilarPosts)
        /** Lecture canonique : /tag/slug */
        router.get('/fetch-post/:slug', BlogController.fetchPostBySlug)
        /** Preview staff (session) */
        router.get(
            '/fetch-post-preview/:shareCode',
            AuthMiddleware.isAuthenticated,
            BlogController.fetchPostPreview
        )
        /** Page de partage : /post/shareCode */
        router.get('/fetch-post-by-code/:shareCode', BlogController.fetchPostByShareCode)

        // Commentaires
        router.get('/fetch-comments/:postId', CommentController.fetchComments)
        router.post(
            '/create-comment',
            AuthMiddleware.isAuthenticated,
            ValidateMiddleware.body(validateCreateComment),
            CommentController.createComment
        )
        router.post(
            '/vote-comment/:id',
            AuthMiddleware.isAuthenticated,
            ValidateMiddleware.body(validateVoteComment),
            CommentController.voteComment
        )
        router.delete(
            '/delete-comment/:id',
            AuthMiddleware.isAuthenticated,
            CommentController.deleteComment
        )

        // Favoris / marque-pages
        router.get(
            '/fetch-favorites',
            AuthMiddleware.isAuthenticated,
            FavoriteController.fetchFavorites
        )
        router.post(
            '/toggle-favorite/:postId',
            AuthMiddleware.isAuthenticated,
            FavoriteController.toggleFavorite
        )

        // Fichiers (upload authentifié + rate-limit ; lecture publique par UUID)
        router.get('/files/:id', FileController.getFile)
        router.post(
            '/upload-file',
            AuthMiddleware.isAuthenticated,
            RateLimitMiddleware.upload,
            upload.single('file'),
            FileController.upload
        )

        return router
    }
}
