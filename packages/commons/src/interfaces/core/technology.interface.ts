import type {Category} from '../../constants'

/** Entité DB imbriquée (Prisma TechnologyInfo) */
export interface TechnologyInfo {
    id: string
    websiteUrl: string | null
    docsUrl: string | null
    creator: string | null
    foundedAt: string | null
    versions: TechnologyVersion | null
    userCount: number | null
    projectCount: number | null
    history: string[]
    description: string | null
}

/** Entité DB Technology */
export interface Technology {
    id: string
    name: string
    slug: string
    language: string
    logo: string | null
    usage: string
    categories: Category[]
    isActive: boolean
    createdAt?: string | Date
    info?: TechnologyInfo | null
}

/** Contrat d'écriture serveur */
export interface EditTechnology {
    technology: Omit<Technology, 'createdAt' | 'info'>
    info: Omit<TechnologyInfo, 'id'>
}

export interface TechnologyVersion {
    stable: {num: string; date: string}
    latest: {num: string; date: string}
}

/** @deprecated — préférer TechnologyVersion */
export type TechnoLogyVersion = TechnologyVersion

export interface RawExcelTech {
    Langage: string
    Framework: string
    Utilisation: string
    Description: string
}
