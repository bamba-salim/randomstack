import {Category} from "@prisma/client";

export interface RawExcelTech {
    Langage: string
    Framework: string
    Utilisation: string
    Description: string
}

export interface DrawnStack {
    clientLayer: Technology | null     // Présentation (Frontend, Mobile ou Desktop)
    serverLayer: Technology | null     // Logique métier (Backend)
    databaseLayer: Technology | null   // Persistance (Database, Cache, BaaS)
    timestamp: string
}

export interface SaveTechnologyDTO {
    id?: string
    name: string
    language: string
    usage: string
    description: string
    category: Category
    logo?: string | null
}
