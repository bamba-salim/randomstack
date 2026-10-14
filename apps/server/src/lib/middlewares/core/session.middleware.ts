import session from 'express-session'
import type {RequestHandler} from 'express'
import crypto from 'crypto'

/** Cookie session unique (client + extranet) */
export const SESSION_COOKIE = 'rs.sid'

/** @deprecated — alias de SESSION_COOKIE */
export const CLIENT_SESSION_COOKIE = SESSION_COOKIE
/** @deprecated — alias de SESSION_COOKIE */
export const ADMIN_SESSION_COOKIE = SESSION_COOKIE

const cookieOptions = {
    secure: process.env['NODE_ENV'] === 'production' && process.env['COOKIE_SECURE'] !== 'false'
        ? true
        : false,
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
}

function resolveSessionSecret(): string {
    const fromEnv = process.env['SESSION_SECRET']?.trim()
    const isProd = process.env['NODE_ENV'] === 'production'

    if (fromEnv && fromEnv.length >= 32) {
        return fromEnv
    }

    if (isProd) {
        console.error(
            '[Session] SESSION_SECRET manquant ou trop court (< 32 caractères). Refus de démarrer en production.'
        )
        process.exit(1)
    }

    // Dev uniquement : secret éphémère (sessions invalidées à chaque restart)
    const ephemeral = crypto.randomBytes(48).toString('hex')
    console.warn(
        '[Session] SESSION_SECRET absent/court — secret éphémère de dev généré. Définis SESSION_SECRET (>= 32) pour la stabilité.'
    )
    return ephemeral
}

const SESSION_SECRET = resolveSessionSecret()

function buildSession(saveUninitialized: boolean): RequestHandler {
    return session({
        name: SESSION_COOKIE,
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized,
        cookie: cookieOptions
    })
}

export default class SessionMiddleware {
    /** Session partagée site public + extranet */
    static readonly config = buildSession(true)

    /** @deprecated — utiliser `.config` */
    static readonly client = SessionMiddleware.config

    /** @deprecated — utiliser `.config` */
    static readonly admin = SessionMiddleware.config
}
