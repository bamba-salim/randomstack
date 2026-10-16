import {Router} from 'express'
import {AuthMiddleware, CacheMiddleware, RateLimitMiddleware, ValidateMiddleware} from '#middlewares'
import {
    validateCreateComment,
    validateCreateInboxMessage,
    validateVoteComment
} from '@randomstack/commons'
import {BlogController, CommentController, FavoriteController} from '#blog'
import {FileController} from '#file'
import {InboxController} from '#inbox'
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
        router.post('/draw-stack', RateLimitMiddleware.draw, StackController.draw)
        router.get('/fetch-draw-history', CacheMiddleware.noStore, StackController.getHistory)
        router.get(
            '/fetch-draw-technologies',
            CacheMiddleware.publicShort,
            StackController.fetchDrawActiveTechnologies
        )
        router.post('/save-share', StackController.saveShare)
        router.get('/fetch-share/:code', CacheMiddleware.publicShort, StackController.fetchShare)

        // Technologies (encyclopédie)
        router.get(
            '/fetch-technologies',
            CacheMiddleware.publicShort,
            TechnologyController.fetchTechnologies
        )
        router.get(
            '/fetch-technology-by-slug/:slug',
            CacheMiddleware.publicShort,
            TechnologyController.fetchTechnologyBySlug
        )

        // Profils publics
        router.get(
            '/fetch-profile/:id',
            CacheMiddleware.publicShort,
            AuthController.fetchPublicProfile
        )

        // Blog — listes / tags (cache CDN OK)
        router.get('/fetch-posts', CacheMiddleware.publicShort, BlogController.fetchPublishedPosts)
        router.get(
            '/fetch-posts/tag/:tag',
            CacheMiddleware.publicShort,
            BlogController.fetchPostsByTag
        )
        router.get(
            '/fetch-posts/author/:authorId',
            CacheMiddleware.publicShort,
            BlogController.fetchPostsByAuthor
        )
        router.get('/fetch-tags', CacheMiddleware.publicShort, BlogController.fetchUniqueTags)
        router.get(
            '/fetch-similar-posts/:slug',
            CacheMiddleware.publicShort,
            BlogController.fetchSimilarPosts
        )
        /** Lecture canonique : /tag/slug — isFavorite dépend de la session → no-store */
        router.get('/fetch-post/:slug', CacheMiddleware.noStore, BlogController.fetchPostBySlug)
        /** Preview staff (session) */
        router.get(
            '/fetch-post-preview/:shareCode',
            AuthMiddleware.isAuthenticated,
            CacheMiddleware.noStore,
            BlogController.fetchPostPreview
        )
        /** Page de partage : /post/shareCode */
        router.get(
            '/fetch-post-by-code/:shareCode',
            CacheMiddleware.publicShort,
            BlogController.fetchPostByShareCode
        )

        // Commentaires
        router.get(
            '/fetch-comments/:postId',
            CacheMiddleware.publicShort,
            CommentController.fetchComments
        )
        router.post(
            '/create-comment',
            AuthMiddleware.isAuthenticated,
            RateLimitMiddleware.comment,
            ValidateMiddleware.body(validateCreateComment),
            CommentController.createComment
        )
        router.post(
            '/vote-comment/:id',
            AuthMiddleware.isAuthenticated,
            RateLimitMiddleware.vote,
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
            CacheMiddleware.noStore,
            FavoriteController.fetchFavorites
        )
        router.post(
            '/toggle-favorite/:postId',
            AuthMiddleware.isAuthenticated,
            FavoriteController.toggleFavorite
        )

        // Fichiers (upload authentifié + rate-limit ; lecture publique par UUID)
        // Cache headers posés dans FileController (302 signé ≠ fichier local)
        router.get('/files/:id', FileController.getFile)
        router.post(
            '/upload-file',
            AuthMiddleware.isAuthenticated,
            RateLimitMiddleware.upload,
            upload.single('file'),
            FileController.upload
        )

        // Inbox — signalements / suggestions (auth)
        router.post(
            '/create-inbox-message',
            AuthMiddleware.isAuthenticated,
            RateLimitMiddleware.inbox,
            ValidateMiddleware.body(validateCreateInboxMessage),
            InboxController.create
        )

        return router
    }
}
