import session from 'express-session'
import type {RequestHandler} from 'express'

/** Cookie session site public (client) */
export const CLIENT_SESSION_COOKIE = 'rs.client.sid'
/** Cookie session extranet (admin) */
export const ADMIN_SESSION_COOKIE = 'rs.admin.sid'

const sharedCookieOptions = {
    secure: process.env['NODE_ENV'] === 'production' && process.env['COOKIE_SECURE'] !== 'false'
        ? true
        : false,
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
}

function buildSession(name: string, saveUninitialized: boolean): RequestHandler {
    return session({
        name,
        secret: process.env['SESSION_SECRET'] || 'randomstack-v0-session-secret',
        resave: false,
        saveUninitialized,
        cookie: sharedCookieOptions
    })
}

export default class SessionMiddleware {
    /** Historique tirage + auth client */
    static readonly client = buildSession(CLIENT_SESSION_COOKIE, true)

    /** Auth extranet + /ws */
    static readonly admin = buildSession(ADMIN_SESSION_COOKIE, false)

    /** @deprecated — préférer `.client` / `.admin` */
    static get config() {
        return SessionMiddleware.client
    }
}
