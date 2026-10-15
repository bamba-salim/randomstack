import type {RequestHandler} from 'express'

/**
 * Headers Cache-Control pour GET publics (navigateur + CDN Cloudflare via s-maxage).
 * Ne pas appliquer aux réponses dépendantes de la session.
 */
export default class CacheMiddleware {
    static headers(value: string): RequestHandler {
        return (_req, res, next) => {
            res.setHeader('Cache-Control', value)
            next()
        }
    }

    /**
     * Listes / fiches publiques — court côté navigateur, un peu plus long en edge.
     * `s-maxage` = Cloudflare ; `stale-while-revalidate` = soft refresh.
     */
    static readonly publicShort = CacheMiddleware.headers(
        'public, max-age=30, s-maxage=120, stale-while-revalidate=60'
    )

    /** Assets locaux immuables (UUID) — long TTL */
    static readonly publicFile = CacheMiddleware.headers(
        'public, max-age=86400, s-maxage=604800, immutable'
    )

    /** Auth / session / favoris / preview */
    static readonly noStore = CacheMiddleware.headers('private, no-store')
}
