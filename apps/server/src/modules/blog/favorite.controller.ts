import type {Request, Response} from 'express'
import FavoriteModel from './favorite.model'
import BlogMapper from './blog.mapper'

export default class FavoriteController {

    private static sessionUserId(req: Request): string | undefined {
        return (req as any).session?.userId as string | undefined
    }

    /** GET /fetch-favorites — authentifié */
    static async fetchFavorites(req: Request, res: Response): Promise<void> {
        try {
            const userId = FavoriteController.sessionUserId(req)
            if (!userId) {
                res.status(401).json({error: 'Authentification requise.'})
                return
            }

            const rows = await FavoriteModel.fetchUserFavorites(userId)
            res.json({
                favorites: BlogMapper.buildPublicPostListedList(rows.map(r => r.post))
            })
        } catch (error: any) {
            console.error('[FavoriteController] Erreur fetchFavorites :', error.message || error)
            res.status(500).json({error: 'Impossible de charger les favoris.'})
        }
    }

    /** POST /toggle-favorite/:postId — authentifié */
    static async toggleFavorite(req: Request, res: Response): Promise<void> {
        try {
            const userId = FavoriteController.sessionUserId(req)
            if (!userId) {
                res.status(401).json({error: 'Connecte-toi pour enregistrer un favori.'})
                return
            }

            const {postId} = req.params
            if (!postId) {
                res.status(400).json({error: 'Article manquant.'})
                return
            }

            const exists = await FavoriteModel.postExistsPublished(postId)
            if (!exists) {
                res.status(404).json({error: 'Article introuvable ou non publié.'})
                return
            }

            const isFavorite = await FavoriteModel.toggle(userId, postId)
            res.json({success: true as const, isFavorite})
        } catch (error: any) {
            console.error('[FavoriteController] Erreur toggleFavorite :', error.message || error)
            res.status(500).json({error: 'Impossible de mettre à jour le favori.'})
        }
    }
}
