import type {ErrorRequestHandler, RequestHandler} from 'express'
import {logServerError, publicErrorMessage} from '#utils'

/**
 * Erreurs Express non catchées (next(err), JSON invalide, CORS, etc.).
 * Jamais de stack / détail Prisma dans la réponse en production.
 */
export default class ErrorMiddleware {
    static readonly notFound: RequestHandler = (_req, res) => {
        res.status(404).json({error: 'Ressource introuvable.'})
    }

    static readonly handle: ErrorRequestHandler = (err, _req, res, _next) => {
        logServerError('[API]', err)

        if (res.headersSent) return

        // Body JSON invalide (express.json)
        if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
            res.status(400).json({error: 'Corps de requête JSON invalide.'})
            return
        }

        // Payload trop gros
        if (err?.type === 'entity.too.large') {
            res.status(413).json({error: 'Requête trop volumineuse.'})
            return
        }

        // Multer
        if (err?.name === 'MulterError') {
            const msg =
                err.code === 'LIMIT_FILE_SIZE'
                    ? 'Fichier trop volumineux (5 Mo max).'
                    : 'Erreur lors de l’upload.'
            res.status(400).json({error: msg})
            return
        }

        // CORS (callback Error)
        if (err instanceof Error && /cors|politique CORS/i.test(err.message)) {
            res.status(403).json({error: 'Accès refusé par la politique CORS.'})
            return
        }

        const status = typeof err?.status === 'number'
            ? err.status
            : typeof err?.statusCode === 'number'
                ? err.statusCode
                : 500

        res.status(status >= 400 && status < 600 ? status : 500).json({
            error: publicErrorMessage(err, 'Erreur serveur.')
        })
    }
}
