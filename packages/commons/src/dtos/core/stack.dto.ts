import type {Category, CompatibilityKind} from '../../constants'
import type {TechnologyVersion} from '../../interfaces/core/technology.interface'

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

    /** IDs technos liées (catégories disjointes) */
    recommendedIds?: string[]
    worksWithIds?: string[]
    incompatibleIds?: string[]
}

/** Nœud léger pour listes / graphe de compatibilité */
export interface TechnologyCompatLite {
    id: string
    slug: string
    name: string
    logo: string | null
    categories: Category[]
    kind: CompatibilityKind
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
    /** Ego-graphe / listes (recommandé + compatible) */
    compatibilities: TechnologyCompatLite[]
    /** Liste exhaustive des vrais conflits */
    incompatibilities: TechnologyCompatLite[]
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