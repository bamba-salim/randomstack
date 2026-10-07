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
     * Moteur de résolution de l'article "À la une" pour le flux global (Home / Blog)
     * Règle des 48h : si l'article épinglé a plus de 48h, le dernier article publié devient featured.
     */
    static async resolveFeaturedPost() {
        // 1. Cherche l'article explicitement épinglé par l'administrateur
        let featured = await BlogModel.fetchExplicitFeaturedPost()

        // 2. Règle des 48h : vérification de l'âge de publication
        if (featured) {
            const publishDate = featured.publishAt || featured.createdAt
            if (this.isOlderThanHours(publishDate, 48)) {
                // Trop ancien : on annule la mise en avant explicite
                featured = null
            }
        }

        // 3. Fallback : s'il n'y a pas d'article à la une (ou s'il est périmé), on prend le plus récent
        if (!featured) {
            featured = await BlogModel.fetchLatestPost()
        }

        return featured
    }

    /**
     * Moteur de résolution de l'article "À la une" pour un tag spécifique (/tag/:tag)
     * Applique la même règle des 48h et le même fallback sur le flux filtré par tag.
     */
    static async resolveFeaturedPostByTag(tag: string) {
        // 1. Cherche l'article épinglé pour ce tag spécifique
        let featured = await BlogModel.fetchExplicitFeaturedPostByTag(tag)

        // 2. Règle des 48h
        if (featured) {
            const publishDate = featured.publishAt || featured.createdAt
            if (this.isOlderThanHours(publishDate, 48)) {
                featured = null
            }
        }

        // 3. Fallback : article le plus récent avec ce tag
        if (!featured) {
            featured = await BlogModel.fetchLatestPostByTag(tag)
        }

        return featured
    }
}