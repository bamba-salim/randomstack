import BlogModel from './blog.model'

export default class BlogAction {

    /**
     * Utilitaire interne : vérifie si une date a dépassé un certain seuil en heures
     */
    private static isOlderThanHours(date: Date | string, maxHours: number): boolean {
        const ageInMilliseconds = Date.now() - new Date(date).getTime()
        const ageInHours = ageInMilliseconds / (1000 * 60 * 60)
        return ageInHours > maxHours
    }

    /**
     * Choisit l’article « à la une » parmi une liste déjà chargée (1 requête amont).
     * Règle 48h : épinglé périmé → fallback sur le plus récent.
     */
    private static pickFeatured(candidates: any[]): any | null {
        if (!candidates.length) return null

        const pinned = candidates.find(p => p.isFeatured)
        if (pinned) {
            const publishDate = pinned.publishAt || pinned.createdAt
            if (!this.isOlderThanHours(publishDate, 48)) {
                return pinned
            }
        }

        // Plus récent par date (indépendant de l’ordre isFeatured)
        const byDate = [...candidates].sort((a, b) => {
            const da = new Date(a.publishAt || a.createdAt).getTime()
            const db = new Date(b.publishAt || b.createdAt).getTime()
            return db - da
        })
        return byDate[0] ?? null
    }

    /**
     * Moteur de résolution de l'article "À la une" pour le flux global (Home / Blog)
     * Une seule requête Prisma (candidats featured + récents).
     */
    static async resolveFeaturedPost() {
        const candidates = await BlogModel.fetchFeaturedCandidates()
        return this.pickFeatured(candidates)
    }

    /**
     * Moteur de résolution de l'article "À la une" pour un tag spécifique (/tag/:tag)
     */
    static async resolveFeaturedPostByTag(tag: string) {
        const candidates = await BlogModel.fetchFeaturedCandidatesByTag(tag)
        return this.pickFeatured(candidates)
    }
}
