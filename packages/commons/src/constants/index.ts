export const TABLE = {
    TECHNOLOGY: 'technology',
    POST: 'post',
    USER: 'user',
    Comment: 'comment'
}

export const FILE_TYPE = {
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    DOCUMENT: 'DOCUMENT',
    OTHER: 'OTHER'
}

export const TECHNOLOGY_CATEGORY = {
    FRONTEND: 'FRONTEND',
    BACKEND: 'BACKEND',
    DATABASE: 'DATABASE',
    MOBILE: 'MOBILE',
    DESKTOP: 'DESKTOP',
    /** Encyclopédie — hors tirage `/draft` (sauf BAAS → couche serveur) */
    API: 'API',
    CMS: 'CMS',
    AI_AGENT: 'AI_AGENT',
    LIBRARY: 'LIBRARY',
    ORM: 'ORM',
    /** BaaS : tirable comme backend (Firebase, Supabase…) */
    BAAS: 'BAAS',
} as const

/** Catégories éligibles au générateur `/draft` */
export const DRAW_ELIGIBLE_CATEGORIES = [
    TECHNOLOGY_CATEGORY.FRONTEND,
    TECHNOLOGY_CATEGORY.BACKEND,
    TECHNOLOGY_CATEGORY.DATABASE,
    TECHNOLOGY_CATEGORY.MOBILE,
    TECHNOLOGY_CATEGORY.DESKTOP,
    TECHNOLOGY_CATEGORY.BAAS,
] as const

/** Couche serveur du tirage = BACKEND + BaaS */
export const DRAW_SERVER_CATEGORIES = [
    TECHNOLOGY_CATEGORY.BACKEND,
    TECHNOLOGY_CATEGORY.BAAS,
] as const

/** Libellés UI (admin / encyclopédie) */
export const TECHNOLOGY_CATEGORY_LABELS: Record<
    (typeof TECHNOLOGY_CATEGORY)[keyof typeof TECHNOLOGY_CATEGORY],
    string
> = {
    FRONTEND: 'Frontend',
    BACKEND: 'Backend',
    DATABASE: 'Base de données',
    MOBILE: 'Mobile',
    DESKTOP: 'Desktop',
    API: 'API',
    CMS: 'CMS',
    AI_AGENT: 'Agent IA',
    LIBRARY: 'Librairies',
    ORM: 'ORM',
    BAAS: 'BaaS',
}

export const COMPATIBILITY_KIND = {
    WORKS_WITH: 'WORKS_WITH',
    RECOMMENDED: 'RECOMMENDED',
    INCOMPATIBLE: 'INCOMPATIBLE',
} as const

export const COMPATIBILITY_KIND_LABELS: Record<
    (typeof COMPATIBILITY_KIND)[keyof typeof COMPATIBILITY_KIND],
    string
> = {
    WORKS_WITH: 'Compatible',
    RECOMMENDED: 'Recommandé',
    INCOMPATIBLE: 'Incompatible',
}

/** Inbox extranet — kinds de messages */
export const INBOX_KIND = {
    TECH_REPORT: 'TECH_REPORT',
    POST_REPORT: 'POST_REPORT',
    TECH_SUGGESTION: 'TECH_SUGGESTION',
    ARTICLE_SUGGESTION: 'ARTICLE_SUGGESTION',
    AUTHOR_REQUEST: 'AUTHOR_REQUEST',
} as const

export const INBOX_KIND_LABELS: Record<
    (typeof INBOX_KIND)[keyof typeof INBOX_KIND],
    string
> = {
    TECH_REPORT: 'Signalement techno',
    POST_REPORT: 'Signalement article',
    TECH_SUGGESTION: 'Suggestion techno',
    ARTICLE_SUGGESTION: 'Suggestion article',
    AUTHOR_REQUEST: 'Demande statut auteur',
}

export const INBOX_STATUS = {
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    RESOLVED: 'RESOLVED',
    DISMISSED: 'DISMISSED',
} as const

export const INBOX_STATUS_LABELS: Record<
    (typeof INBOX_STATUS)[keyof typeof INBOX_STATUS],
    string
> = {
    OPEN: 'Ouvert',
    IN_PROGRESS: 'En cours',
    RESOLVED: 'Traité',
    DISMISSED: 'Rejeté',
}

export const USER_ROLE = {
    USER: 'USER',
    AUTHOR: 'AUTHOR',
    MODERATOR: 'MODERATOR',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

/**
 * Visibilité inbox par rôle staff.
 * ADMIN voit tout ; les autres ne voient que les kinds listés.
 */
export const INBOX_KIND_ROLES: Record<
    (typeof INBOX_KIND)[keyof typeof INBOX_KIND],
    ReadonlyArray<(typeof USER_ROLE)[keyof typeof USER_ROLE]>
> = {
    TECH_REPORT: [USER_ROLE.ADMIN, USER_ROLE.EDITOR],
    POST_REPORT: [USER_ROLE.ADMIN, USER_ROLE.EDITOR, USER_ROLE.MODERATOR],
    TECH_SUGGESTION: [USER_ROLE.ADMIN, USER_ROLE.EDITOR],
    ARTICLE_SUGGESTION: [USER_ROLE.ADMIN, USER_ROLE.EDITOR, USER_ROLE.AUTHOR],
    AUTHOR_REQUEST: [USER_ROLE.ADMIN, USER_ROLE.MODERATOR],
}

export const POST_STATUS = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED',
    SCHEDULED: 'SCHEDULED',
    DELETED: 'DELETED'
}

export const BLOCK_TYPE = {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    CODE: 'CODE',
    DOUBLE_CONTENT: 'DOUBLE_CONTENT',
    H2: 'H2',
    H3: 'H3',
    QUOTE: 'QUOTE',
    NDLR: 'NDLR',
    LIST_UL: 'LIST_UL',
    LIST_OL: 'LIST_OL'
}

export type FileType = typeof FILE_TYPE[keyof typeof FILE_TYPE]
export type Category = typeof TECHNOLOGY_CATEGORY[keyof typeof TECHNOLOGY_CATEGORY]
export type CompatibilityKind = typeof COMPATIBILITY_KIND[keyof typeof COMPATIBILITY_KIND]
export type InboxKind = typeof INBOX_KIND[keyof typeof INBOX_KIND]
export type InboxStatus = typeof INBOX_STATUS[keyof typeof INBOX_STATUS]
export type Role = typeof USER_ROLE[keyof typeof USER_ROLE]
export type PostStatus = typeof POST_STATUS[keyof typeof POST_STATUS]
export type BlockType = typeof BLOCK_TYPE[keyof typeof BLOCK_TYPE]
export type Table = typeof TABLE[keyof typeof TABLE]

/** Kinds visibles pour un rôle staff (ADMIN = tous). */
export function inboxKindsForRole(role: Role): InboxKind[] {
    if (role === USER_ROLE.ADMIN) {
        return Object.values(INBOX_KIND)
    }
    return (Object.keys(INBOX_KIND_ROLES) as InboxKind[]).filter(kind =>
        INBOX_KIND_ROLES[kind].includes(role)
    )
}