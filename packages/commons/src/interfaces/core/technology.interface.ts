import type {Category} from '../../types'


export interface TechnologyDetail {
    id: string // Clé primaire identique à l'ID de la technologie associée 🚀
    websiteUrl: string | null
    docsUrl: string | null
    creator: string | null
    foundedAt: string | null
    versions: any | null // Stockera { stable: { num: string, date: string }, latest: { num: string, date: string } }
    userCount: number | null
    projectCount: number | null
    history: string[]
    description: string | null
}

export interface Technology {
    id: string
    name: string
    slug: string
    language: string
    logo: string | null
    usage: string
    categories: Category[]
    createdAt?: string | Date
    detail?: TechnologyDetail | null // Jointure vers la table de détails 🚀
}

export interface EditTechnology {
    technology: Omit<Technology, 'createdAt' | 'detail'>
    detail: Omit<TechnologyDetail, 'id'>
}

export interface RawExcelTech {
    Langage: string
    Framework: string
    Utilisation: string
    Description: string
}