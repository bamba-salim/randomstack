
export interface DrawnStack {
    clientLayer: Technology | null
    serverLayer: Technology | null
    databaseLayer: Technology | null
    timestamp: string
}

export interface RawExcelTech {
    Langage: string
    Framework: string
    Utilisation: string
    Description: string
}