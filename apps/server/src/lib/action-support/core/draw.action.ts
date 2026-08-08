import type {Technology, Category, DrawnStack} from '@randomstack/commons'

export default class DrawAction {

    static run(techs: Technology[]): DrawnStack {
        const getByCategory = (cats: Category[]): Technology | null => {
            const filtered = techs.filter(t => t.categories.some(cat => cats.includes(cat)))
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