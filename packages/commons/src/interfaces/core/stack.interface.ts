import type {Category} from '../../constants'

/** Contrat d'écriture share (serveur) */
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
