import type {Category} from '../../types'

export interface Technology {
    id: string
    name: string
    language: string
    logo: string | null
    usage: string
    description: string
    categories: Category[]
    createdAt: string | Date
}

export interface SaveTechnologyInput {
    id?: string
    name: string
    language: string
    categories: Category[]
    usage: string
    description: string
    logo?: any // File sur le client, string ou Buffer sur le serveur
}
