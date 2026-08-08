import type {Technology} from "./technology.interface";


export interface DrawnStack {
    clientLayer: Technology | null
    serverLayer: Technology | null
    databaseLayer: Technology | null
    timestamp: string
}

export interface DrawResponse {
    current: DrawnStack
    history: DrawnStack[]
}

export interface RawExcelTech {
    Langage: string
    Framework: string
    Utilisation: string
    Description: string
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