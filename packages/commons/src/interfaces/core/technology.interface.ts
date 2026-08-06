import {Category} from '../../types'

export interface Technology {
    id: string
    name: string
    language: string
    logo: string | null
    usage: string
    description: string
    category: Category
    createdAt: string | Date
}

export interface SaveTechnologyInput {
    id?: string
    name: string
    language: string
    category: Category
    usage: string
    description: string
    logo?: any // File sur le client, string ou Buffer sur le serveur
}

export interface SaveStackDTO {
    shareCode: string
    projectType: Category
    frontendId: string
    backendId: string
    databaseId: string
    ormId?: string | null
    expiresAt: Date
    createdAt: Date
}