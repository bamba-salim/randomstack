import type {Request, Response} from 'express'
import {PostModel} from '#models'

export default class PostController {
    // Récupérer un article spécifique (avec barrière de prévisualisation sécurisée) 🔒
    static async fetchPostBySlug(req: Request, res: Response): Promise<void> {
        try {
            const {slug} = req.params
            const isPreview = req.query['preview'] === 'true'

            const post = await PostModel.fetchPostBySlug(slug)
            if (!post) {
                res.status(404).json({error: 'Article introuvable.'})
                return
            }

            // Barrière de sécurité : Si l'article n'est pas publié et que l'appelant n'est pas Admin/Editeur connecté, on renvoie une 404 🔒
            const session = req.session as any
            const isAuthorizedAdmin = session?.userId && ['ADMIN', 'EDITOR', 'MODERATOR'].includes(session.userRole)

            if (post.status !== 'PUBLISHED' && (!isPreview || !isAuthorizedAdmin)) {
                res.status(404).json({error: 'Article introuvable.'})
                return
            }

            res.json(post)
        } catch {
            res.status(500).json({error: "Erreur lors de la récupération de l'article."})
        }
    }

    static async fetchPosts(req: Request, res: Response): Promise<void> {
        try {
            const posts = await PostModel.fetchPublishedPost()
            res.json(posts)
        } catch {
            res.status(500).json({error: "Erreur lors de la récupération des articles."})
        }

    }
}