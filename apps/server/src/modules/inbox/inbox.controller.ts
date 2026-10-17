import type {Request, Response} from 'express'
import {
    inboxKindsForRole,
    INBOX_KIND,
    type CreateInboxMessageFormBean,
    type InboxKind,
    type Role,
    type UpdateInboxStatusFormBean
} from '@randomstack/commons'
import {TechnologyModel} from '#stack'
import {BlogModel} from '#blog'
import InboxModel from './inbox.model'
import InboxMapper from './inbox.mapper'

export default class InboxController {

    /** POST public (auth) — créer un message inbox */
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.session.userId
            if (!userId) {
                res.status(401).json({error: 'Connexion requise.'})
                return
            }

            const data = req.body as CreateInboxMessageFormBean
            let techName: string | null = null
            let postTitle: string | null = null

            if (data.technologyId) {
                const tech = await TechnologyModel.fetchTechnologyById(data.technologyId)
                if (!tech) {
                    res.status(400).json({error: 'Technologie introuvable.', field: 'technologyId'})
                    return
                }
                techName = tech.name
            }

            if (data.postId) {
                const post = await BlogModel.fetchPostById(data.postId)
                if (!post) {
                    res.status(400).json({error: 'Article introuvable.', field: 'postId'})
                    return
                }
                postTitle = post.title
            }

            if (data.kind === INBOX_KIND.TECH_REPORT && !data.technologyId) {
                res.status(400).json({error: 'Technologie requise.', field: 'technologyId'})
                return
            }
            if (data.kind === INBOX_KIND.POST_REPORT && !data.postId) {
                res.status(400).json({error: 'Article requis.', field: 'postId'})
                return
            }

            const subject =
                data.subject?.trim()
                || InboxMapper.defaultSubject(data.kind, techName, postTitle)

            const row = await InboxModel.create({
                kind: data.kind,
                subject,
                body: data.body,
                authorId: userId,
                technologyId: data.technologyId,
                postId: data.postId
            })

            res.status(201).json({success: true, message: InboxMapper.toListed(row)})
        } catch (error) {
            console.error('[InboxController] create :', error)
            res.status(500).json({error: 'Impossible d’envoyer le message.'})
        }
    }

    /** GET admin — liste filtrée par rôle */
    static async fetchMessages(req: Request, res: Response): Promise<void> {
        try {
            const role = req.session.userRole as Role | undefined
            if (!role) {
                res.status(401).json({error: 'Non authentifié.'})
                return
            }

            const kinds = inboxKindsForRole(role)
            const rows = await InboxModel.fetchForKinds(kinds)
            res.json(InboxMapper.toListedList(rows))
        } catch (error) {
            console.error('[InboxController] fetchMessages :', error)
            res.status(500).json({error: 'Impossible de charger l’inbox.'})
        }
    }

    /** GET admin — détail d’un message */
    static async fetchMessage(req: Request, res: Response): Promise<void> {
        try {
            const role = req.session.userRole as Role | undefined
            if (!role) {
                res.status(401).json({error: 'Non authentifié.'})
                return
            }

            const {id} = req.params
            if (!id) {
                res.status(400).json({error: 'Identifiant manquant.'})
                return
            }

            const row = await InboxModel.fetchById(id)
            if (!row) {
                res.status(404).json({error: 'Message introuvable.'})
                return
            }

            const allowed = inboxKindsForRole(role)
            if (!allowed.includes(row.kind as any)) {
                res.status(403).json({error: 'Accès refusé à ce type de message.'})
                return
            }

            res.json(InboxMapper.toListed(row))
        } catch (error) {
            console.error('[InboxController] fetchMessage :', error)
            res.status(500).json({error: 'Impossible de charger le message.'})
        }
    }

    /** GET admin — badge nav (messages OPEN visibles pour le rôle) */
    static async fetchOpenCount(req: Request, res: Response): Promise<void> {
        try {
            const role = req.session.userRole as Role | undefined
            if (!role) {
                res.status(401).json({error: 'Non authentifié.'})
                return
            }

            const kinds = inboxKindsForRole(role)
            const count = await InboxModel.countOpen(kinds)
            res.json({count})
        } catch (error) {
            console.error('[InboxController] fetchOpenCount :', error)
            res.status(500).json({error: 'Impossible de compter les messages.'})
        }
    }

    /**
     * GET admin — signalements actifs liés à une techno ou un article
     * Query : technologyId=… | postId=…
     */
    static async fetchTargetReports(req: Request, res: Response): Promise<void> {
        try {
            const role = req.session.userRole as Role | undefined
            if (!role) {
                res.status(401).json({error: 'Non authentifié.'})
                return
            }

            const technologyId = typeof req.query['technologyId'] === 'string'
                ? req.query['technologyId'].trim()
                : ''
            const postId = typeof req.query['postId'] === 'string'
                ? req.query['postId'].trim()
                : ''

            if (!technologyId && !postId) {
                res.status(400).json({error: 'technologyId ou postId requis.'})
                return
            }
            if (technologyId && postId) {
                res.status(400).json({error: 'Un seul filtre à la fois.'})
                return
            }

            const allowed = new Set(inboxKindsForRole(role))
            const reportKinds: InboxKind[] = technologyId
                ? [INBOX_KIND.TECH_REPORT]
                : [INBOX_KIND.POST_REPORT]
            const kinds = reportKinds.filter(k => allowed.has(k))

            const rows = await InboxModel.fetchActiveReports({
                technologyId: technologyId || undefined,
                postId: postId || undefined,
                kinds
            })
            res.json(InboxMapper.toListedList(rows))
        } catch (error) {
            console.error('[InboxController] fetchTargetReports :', error)
            res.status(500).json({error: 'Impossible de charger les signalements.'})
        }
    }

    /** POST admin — mettre à jour le statut */
    static async updateStatus(req: Request, res: Response): Promise<void> {
        try {
            const role = req.session.userRole as Role | undefined
            const userId = req.session.userId
            if (!role || !userId) {
                res.status(401).json({error: 'Non authentifié.'})
                return
            }

            const {id} = req.params
            if (!id) {
                res.status(400).json({error: 'Identifiant manquant.'})
                return
            }

            const existing = await InboxModel.fetchById(id)
            if (!existing) {
                res.status(404).json({error: 'Message introuvable.'})
                return
            }

            const allowed = inboxKindsForRole(role)
            if (!allowed.includes(existing.kind as any)) {
                res.status(403).json({error: 'Accès refusé à ce type de message.'})
                return
            }

            const {status} = req.body as UpdateInboxStatusFormBean
            const updated = await InboxModel.updateStatus(id, status, userId)
            res.json({success: true, message: InboxMapper.toListed(updated)})
        } catch (error) {
            console.error('[InboxController] updateStatus :', error)
            res.status(500).json({error: 'Impossible de mettre à jour le statut.'})
        }
    }
}
