import type {Request, Response, NextFunction, RequestHandler} from 'express'

type Bucket = {count: number; resetAt: number}

/** Clé user session si dispo, sinon IP (évite de coller tout un NAT sur un compte). */
function sessionOrIp(req: Request): string {
    return req.session?.userId || req.ip || 'unknown'
}

/**
 * Rate-limit mémoire (par process) — freine brute-force / spam.
 * En multi-instance, préférer Redis ; suffisant pour un seul serveur.
 */
export default class RateLimitMiddleware {
    static limit(options: {
        windowMs: number
        max: number
        message?: string
        key?: (req: Request) => string
    }): RequestHandler {
        const buckets = new Map<string, Bucket>()
        const message = options.message || 'Trop de requêtes. Réessaie plus tard.'

        return (req: Request, res: Response, next: NextFunction): void => {
            const now = Date.now()
            const key = options.key?.(req) || req.ip || 'unknown'
            let bucket = buckets.get(key)

            if (!bucket || now >= bucket.resetAt) {
                bucket = {count: 0, resetAt: now + options.windowMs}
                buckets.set(key, bucket)
            }

            bucket.count += 1

            if (bucket.count > options.max) {
                const retrySec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
                res.setHeader('Retry-After', String(retrySec))
                res.status(429).json({error: message})
                return
            }

            next()
        }
    }

    /** Login / admin login */
    static readonly auth = RateLimitMiddleware.limit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        message: 'Trop de tentatives de connexion. Réessaie dans quelques minutes.'
    })

    /** Inscription */
    static readonly register = RateLimitMiddleware.limit({
        windowMs: 60 * 60 * 1000,
        max: 10,
        message: 'Trop de créations de compte. Réessaie plus tard.'
    })

    /** Upload */
    static readonly upload = RateLimitMiddleware.limit({
        windowMs: 15 * 60 * 1000,
        max: 40,
        message: 'Trop d’uploads. Réessaie plus tard.'
    })

    /** Commentaires (auth) */
    static readonly comment = RateLimitMiddleware.limit({
        windowMs: 15 * 60 * 1000,
        max: 50,
        message: 'Trop de commentaires. Réessaie plus tard.',
        key: sessionOrIp
    })

    /** Votes commentaires (auth) */
    static readonly vote = RateLimitMiddleware.limit({
        windowMs: 15 * 60 * 1000,
        max: 60,
        message: 'Trop de votes. Réessaie plus tard.',
        key: sessionOrIp
    })

    /** Sauvegarde article extranet (auth) */
    static readonly savePost = RateLimitMiddleware.limit({
        windowMs: 15 * 60 * 1000,
        max: 40,
        message: 'Trop de sauvegardes. Réessaie plus tard.',
        key: sessionOrIp
    })

    /** Tirage stack (public) */
    static readonly draw = RateLimitMiddleware.limit({
        windowMs: 15 * 60 * 1000,
        max: 60,
        message: 'Trop de tirages. Réessaie plus tard.'
    })
}
