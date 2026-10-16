import type {Response} from 'express'

const isProd = () => process.env['NODE_ENV'] === 'production'

/** Codes Prisma connus → message client sûr (jamais le détail SQL). */
const PRISMA_CLIENT_MESSAGES: Record<string, string> = {
    P2002: 'Cette valeur est déjà utilisée.',
    P2025: 'Ressource introuvable.',
    P2003: 'Référence invalide.',
    P2014: 'Opération impossible (contrainte liée).'
}

function prismaCode(error: unknown): string | undefined {
    if (!error || typeof error !== 'object') return undefined
    const code = (error as {code?: unknown}).code
    return typeof code === 'string' && /^P\d{4}$/.test(code) ? code : undefined
}

function looksInternal(message: string): boolean {
    return /prisma|postgres|ECONNREFUSED|SQLITE|at Object\.|\/node_modules\//i.test(message)
}

/**
 * Message exposable au client.
 * Prod : jamais stack / Prisma brut — seulement fallback ou mapping code.
 * Dev : message Error si non-interne, sinon fallback.
 */
export function publicErrorMessage(error: unknown, fallback: string): string {
    const code = prismaCode(error)
    if (code && PRISMA_CLIENT_MESSAGES[code]) {
        return PRISMA_CLIENT_MESSAGES[code]!
    }

    if (!isProd() && error instanceof Error && error.message && !looksInternal(error.message)) {
        return error.message
    }

    return fallback
}

/** Log serveur : message toujours ; stack seulement hors prod. */
export function logServerError(label: string, error: unknown): void {
    if (error instanceof Error) {
        console.error(label, error.message)
        if (!isProd() && error.stack) {
            console.error(error.stack)
        }
        return
    }
    console.error(label, error)
}

/** 5xx / erreur métier mappée — corps JSON sans stack ni détail Prisma. */
export function sendSafeError(
    res: Response,
    error: unknown,
    opts: {label: string; fallback: string; status?: number}
): void {
    logServerError(opts.label, error)
    if (res.headersSent) return
    res.status(opts.status ?? 500).json({
        error: publicErrorMessage(error, opts.fallback)
    })
}
