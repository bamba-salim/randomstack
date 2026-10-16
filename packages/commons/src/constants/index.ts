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

export const USER_ROLE = {
    USER: 'USER',
    AUTHOR: 'AUTHOR',
    MODERATOR: 'MODERATOR',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
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
export type Role = typeof USER_ROLE[keyof typeof USER_ROLE]
export type PostStatus = typeof POST_STATUS[keyof typeof POST_STATUS]
export type BlockType = typeof BLOCK_TYPE[keyof typeof BLOCK_TYPE]
export type Table = typeof TABLE[keyof typeof TABLE]