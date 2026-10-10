import type { Technology, Category, DrawnStack } from '@randomstack/commons'

export default class DrawAction {
    /**
     * Effectue un tirage aléatoire d'un stack complet à partir d'une liste de technologies.
     *
     * Le stack est composé de 3 couches :
     *  - clientLayer  : une techno de type FRONTEND, MOBILE ou DESKTOP
     *  - serverLayer  : une techno de type BACKEND
     *  - databaseLayer: une techno de type DATABASE
     *
     * Pour chaque couche, on filtre les technologies éligibles par catégorie,
     * puis on en sélectionne une au hasard.
     *
     * @param techs - Liste des technologies déjà filtrées (actives + blacklist retirée)
     * @returns Un objet DrawnStack avec les 3 couches tirées et un timestamp
     */
    static run(techs: Technology[]): DrawnStack {
        /**
         * Sélectionne aléatoirement une technologie parmi celles qui appartiennent
         * à au moins une des catégories demandées.
         * Retourne null si aucune technologie éligible n'est disponible.
         */
        const getByCategory = (cats: Category[]): Technology | null => {
            // Garde uniquement les techs dont au moins une catégorie est dans la liste cible
            const filtered = techs.filter(t => t.categories.some(cat => cats.includes(cat)))

            // Aucune techno disponible pour cette couche
            if (filtered.length === 0) return null

            // Tirage aléatoire dans le tableau filtré
            const randomIndex = Math.floor(Math.random() * filtered.length)
            return filtered[randomIndex] || null
        }

        return {
            clientLayer:   getByCategory(['FRONTEND', 'MOBILE', 'DESKTOP']), // couche client (UI)
            serverLayer:   getByCategory(['BACKEND']),                        // couche serveur (API)
            databaseLayer: getByCategory(['DATABASE']),                       // couche base de données
            timestamp: new Date().toLocaleTimeString('fr-FR')                 // heure du tirage
        }
    }
}