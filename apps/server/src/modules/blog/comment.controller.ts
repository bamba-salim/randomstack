import type {Request, Response} from 'express'
import type {CreateCommentFormBean, VoteCommentFormBean} from '@randomstack/commons'
import CommentModel from './comment.model'
import CommentMapper from './comment.mapper'

const MAX_CONTENT_LENGTH = 2000

export default class CommentController {

    private static sessionUser(req: Request) {
        const session = (req as any).session
        return {
            userId: session?.userId as string | undefined,
            userRole: session?.userRole as string | undefined
        }
    }

    /** GET /fetch-comments/:postId — public */
    static async fetchComments(req: Request, res: Response): Promise<void> {
        try {
            const {postId} = req.params
            if (!postId) {
                res.status(400).json({error: 'Identifiant article manquant.'})
                return
            }

            const {userId} = CommentController.sessionUser(req)
            const comments = await CommentModel.fetchByPostId(postId)
            res.json(CommentMapper.buildCommentsListResponse(comments, userId))
        } catch (error: any) {
            console.error('[CommentController] Erreur fetchComments :', error.message || error)
            res.status(500).json({error: 'Impossible de charger les commentaires.'})
        }
    }

    /** POST /create-comment — authentifié */
    static async createComment(req: Request, res: Response): Promise<void> {
        try {
            const {userId} = CommentController.sessionUser(req)
            if (!userId) {
                res.status(401).json({error: 'Connecte-toi pour commenter.'})
                return
            }

            const body = req.body as CreateCommentFormBean
            const postId = String(body?.postId || '').trim()
            const content = String(body?.content || '').trim()

            if (!postId) {
                res.status(400).json({error: 'Article manquant.'})
                return
            }

            if (!content) {
                res.status(400).json({error: 'Le commentaire ne peut pas être vide.'})
                return
            }

            if (content.length > MAX_CONTENT_LENGTH) {
                res.status(400).json({error: `Commentaire trop long (max ${MAX_CONTENT_LENGTH} caractères).`})
                return
            }

            const exists = await CommentModel.postExistsPublished(postId)
            if (!exists) {
                res.status(404).json({error: 'Article introuvable ou non publié.'})
                return
            }

            const comment = await CommentModel.create(postId, userId, content)
            res.status(201).json(CommentMapper.buildCreateCommentResponse(comment, userId))
        } catch (error: any) {
            console.error('[CommentController] Erreur createComment :', error.message || error)
            res.status(500).json({error: 'Impossible de publier le commentaire.'})
        }
    }

    /**
     * POST /vote-comment/:id — authentifié
     * body.vote = LIKE | DISLIKE | null (retire le vote)
     * Même vote renvoyé → retire (toggle)
     */
    static async voteComment(req: Request, res: Response): Promise<void> {
        try {
            const {userId} = CommentController.sessionUser(req)
            if (!userId) {
                res.status(401).json({error: 'Connecte-toi pour voter.'})
                return
            }

            const {id} = req.params
            const body = req.body as VoteCommentFormBean
            const requested = body?.vote === undefined ? null : body.vote

            if (requested !== null && requested !== 'LIKE' && requested !== 'DISLIKE') {
                res.status(400).json({error: 'Vote invalide.'})
                return
            }

            const existing = await CommentModel.fetchById(id)
            if (!existing) {
                res.status(404).json({error: 'Commentaire introuvable.'})
                return
            }

            const current = await CommentModel.findVote(id, userId)

            if (requested === null || (current && current.type === requested)) {
                await CommentModel.deleteVote(id, userId)
            } else {
                await CommentModel.upsertVote(id, userId, requested)
            }

            const updated = await CommentModel.fetchById(id)
            if (!updated) {
                res.status(404).json({error: 'Commentaire introuvable.'})
                return
            }

            res.json(CommentMapper.buildVoteCommentResponse(updated, userId))
        } catch (error: any) {
            console.error('[CommentController] Erreur voteComment :', error.message || error)
            res.status(500).json({error: 'Impossible d’enregistrer le vote.'})
        }
    }

    /** DELETE /delete-comment/:id — auteur, MODERATOR ou ADMIN */
    static async deleteComment(req: Request, res: Response): Promise<void> {
        try {
            const {userId, userRole} = CommentController.sessionUser(req)
            if (!userId) {
                res.status(401).json({error: 'Authentification requise.'})
                return
            }

            const {id} = req.params
            const existing = await CommentModel.fetchById(id)
            if (!existing) {
                res.status(404).json({error: 'Commentaire introuvable.'})
                return
            }

            const canDelete =
                existing.user.id === userId ||
                userRole === 'ADMIN' ||
                userRole === 'MODERATOR'

            if (!canDelete) {
                res.status(403).json({error: 'Accès refusé.'})
                return
            }

            await CommentModel.delete(id)
            res.json({success: true})
        } catch (error: any) {
            console.error('[CommentController] Erreur deleteComment :', error.message || error)
            res.status(500).json({error: 'Impossible de supprimer le commentaire.'})
        }
    }
}
