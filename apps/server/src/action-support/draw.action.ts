import type {Technology, Category} from '@prisma/client'

export interface DrawnStack {
    clientLayer: Technology | null     // Présentation (Frontend, Mobile ou Desktop)
    serverLayer: Technology | null     // Logique métier (Backend)
    databaseLayer: Technology | null   // Persistance (Database, Cache, BaaS)
    timestamp: string
}

export default class DrawAction {
    static run(techs: Technology[]): DrawnStack {
        const getByCategory = (cats: Category[]): Technology | null => {
            const filtered = techs.filter(t => cats.includes(t.category))
            if (filtered.length === 0) return null
            const randomIndex = Math.floor(Math.random() * filtered.length)
            return filtered[randomIndex] || null
        }

        return {
            // Le client peut être une techno Web, Mobile ou Desktop
            clientLayer: getByCategory(['FRONTEND', 'MOBILE', 'DESKTOP']),
            // Le serveur logique (Backend)
            serverLayer: getByCategory(['BACKEND']),
            // La base de données
            databaseLayer: getByCategory(['DATABASE']),
            timestamp: new Date().toLocaleTimeString('fr-FR')
        }
    }
}