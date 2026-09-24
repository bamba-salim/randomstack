import { PostModel } from '#models'

export default class PostAction {

    // Moteur de résolution intelligent de l'article "À la une" 🚀
    static async resolveFeaturedPost() {
        // 1. On cherche s'il y a un article explicitement épinglé
        let featured = await PostModel.fetchExplicitFeaturedPost()

        // 2. RÈGLE DES 48H : S'il existe, on vérifie son âge
        if (featured) {
            const publishDate = featured.publishAt || featured.createdAt
            const ageInMilliseconds = Date.now() - new Date(publishDate).getTime()
            const ageInHours = ageInMilliseconds / (1000 * 60 * 60)

            if (ageInHours > 48) {
                // Trop vieux ! On annule la sélection 🚀
                featured = null
            }
        }

        // 3. FALLBACK : Si pas d'article épinglé (ou trop vieux), on prend le dernier publié 🚀
        if (!featured) {
            featured = await PostModel.fetchLatestPost()
        }

        return featured
    }

}