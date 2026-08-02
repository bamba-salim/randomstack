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