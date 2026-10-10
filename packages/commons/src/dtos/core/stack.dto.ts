import type {Category} from '../../constants'
import type {TechnologyVersion} from '../../interfaces'

/** Formulaire création / édition techno (extranet) */
export interface EditTechnologyFormBean {
    id?: string
    name: string
    language: string
    categories: Category[]
    usage: string
    logo?: string | null
    isActive?: boolean

    description?: string | null
    websiteUrl?: string | null
    docsUrl?: string | null
    creator?: string | null
    foundedAt?: string | null
    userCount?: number | null
    projectCount?: number | null
    history?: string[]
    versions?: TechnologyVersion | null
}

/** Liste encyclopédie (cartes) */
export interface PublicTechnologyListed {
    id: string
    slug: string
    name: string
    language: string
    logo: string | null
    usage: string
    categories: Category[]
    descriptionPreview: string | null
}

/** Table admin extranet */
export interface AdminTechnologyListed {
    id: string
    slug: string
    name: string
    language: string
    logo: string | null
    usage: string
    categories: Category[]
    isActive: boolean
}

/** Page publique techno */
export interface PublicTechnologyDetail {
    id: string
    slug: string
    name: string
    language: string
    logo: string | null
    usage: string
    categories: Category[]
    description: string | null
    history: string[]
    websiteUrl: string | null
    docsUrl: string | null
    creator: string | null
    foundedAt: string | null
    versions: TechnologyVersion | null
    userCount: number | null
    projectCount: number | null
}

/** Pool tirage / blacklist (exclu du tirage) */
export interface ExcludeTechnologyLite {
    id: string
    name: string
    logo: string | null
    usage: string
    categories: Category[]
}

/** Couche d'un stack tiré / partagé */
export interface DrawTechnologyLite {
    id: string
    name: string
    slug: string
    logo: string | null
    language: string
    categories: Category[]
}

export interface DrawnStack {
    clientLayer: DrawTechnologyLite | null
    serverLayer: DrawTechnologyLite | null
    databaseLayer: DrawTechnologyLite | null
    timestamp: string
}

export interface DrawResponse {
    current: DrawnStack
    history: DrawnStack[]
}

/** Résolution d'un lien de partage */
export interface SharedStackListed {
    projectType: string
    clientLayer: DrawTechnologyLite | null
    serverLayer: DrawTechnologyLite | null
    databaseLayer: DrawTechnologyLite | null
    timestamp: string
}

/** Historique de tirage (session) */
export interface DrawHistoryResponse {
    history: DrawnStack[]
}

/** Création d'un lien de partage */
export interface ShareCreatedListed {
    success: true
    shareCode: string
    expiresAt: string | Date
}

/** Réponse save techno (admin) */
export interface SaveTechnologyResponse {
    success: true
    technology: AdminTechnologyListed
}