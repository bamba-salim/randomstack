import type { Technology, Category, DrawnStack } from '@randomstack/commons'

export default class DrawAction {
    static run(techs: Technology[]): DrawnStack {
        const getByCategory = (cats: Category[]): Technology | null => {
            const filtered = techs.filter(t => t.categories.some(cat => cats.includes(cat)))
            if (filtered.length === 0) return null
            const randomIndex = Math.floor(Math.random() * filtered.length)
            return filtered[randomIndex] || null
        }

        return {
            clientLayer: getByCategory(['FRONTEND', 'MOBILE', 'DESKTOP']),
            serverLayer: getByCategory(['BACKEND']),
            databaseLayer: getByCategory(['DATABASE']),
            timestamp: new Date().toLocaleTimeString('fr-FR')
        }
    }
}