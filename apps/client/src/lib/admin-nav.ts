import type {Role} from '@randomstack/commons'

export type AdminNavLink = {
    label: string
    href: string
}

const extranetBase = () =>
    String(import.meta.env['VITE_EXTRANET_URL'] || 'http://localhost:5175').replace(/\/$/, '')

/** Rôles autorisés à se connecter à l'extranet */
export const isStaffRole = (role?: Role | string | null): boolean =>
    role === 'ADMIN' || role === 'EDITOR' || role === 'AUTHOR' || role === 'MODERATOR'

/**
 * Liens admin selon les droits :
 * - ADMIN : technologies, articles, utilisateurs
 * - EDITOR : technologies, articles (tous) + à la une, auteurs (lecture)
 * - AUTHOR : articles (les siens)
 * - MODERATOR : articles (lecture) + utilisateurs (USER ↔ AUTHOR)
 */
export const getAdminNavLinks = (role?: Role | string | null): AdminNavLink[] => {
    if (!role || !isStaffRole(role)) return []

    const base = extranetBase()
    const links: AdminNavLink[] = []

    if (role === 'ADMIN' || role === 'EDITOR') {
        links.push({label: 'Technologies', href: `${base}/dashboard`})
    }

    if (role === 'ADMIN' || role === 'EDITOR' || role === 'AUTHOR' || role === 'MODERATOR') {
        links.push({label: 'Articles', href: `${base}/manage-post`})
    }

    if (role === 'ADMIN' || role === 'MODERATOR') {
        links.push({label: 'Utilisateurs', href: `${base}/manage-user`})
    } else if (role === 'EDITOR') {
        links.push({label: 'Auteurs', href: `${base}/manage-user`})
    }

    return links
}
