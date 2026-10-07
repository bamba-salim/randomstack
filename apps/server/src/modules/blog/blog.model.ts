import { BaseModel } from '#abstracts'
import type { EditPost } from '@randomstack/commons'

export default class BlogModel extends BaseModel {

    // =========================================================================
    // 🌐 1. REQUÊTES CLIENT (FRONT-OFFICE PUBLIC)
    // Réservé à l'affichage public : filtre impératif sur status: 'PUBLISHED'
    // =========================================================================

    /**
     * Récupère la liste des articles publiés pour le flux principal
     * (Permet d'exclure l'article à la une pour éviter les doublons)
     */
    static async fetchPublishedPosts(excludeId?: string) {
        return await this.db.post.findMany({
            where: {
                status: 'PUBLISHED',
                id: excludeId ? { not: excludeId } : undefined
            },
            orderBy: { publishAt: 'desc' }
        })
    }

    /**
     * Cherche l'article explicitement marqué comme "À la une" par la rédaction
     */
    static async fetchExplicitFeaturedPost() {
        return await this.db.post.findFirst({
            where: { status: 'PUBLISHED', isFeatured: true },
            orderBy: { publishAt: 'desc' }
        })
    }

    /**
     * Fallback : récupère le tout dernier article publié
     */
    static async fetchLatestPost() {
        return await this.db.post.findFirst({
            where: { status: 'PUBLISHED' },
            orderBy: { publishAt: 'desc' }
        })
    }

    /**
     * Récupère un article publié via son permalien (slug) pour la lecture publique
     */
    static async fetchPublishedPostBySlug(slug: string) {
        return await this.db.post.findFirst({
            where: {
                slug,
                status: 'PUBLISHED'
            }
        })
    }

    /**
     * Récupère les articles publiés rattachés à un tag spécifique
     */
    static async fetchPublishedPostsByTag(tag: string, excludeId?: string) {
        return await this.db.post.findMany({
            where: {
                status: 'PUBLISHED',
                tags: { has: tag },
                id: excludeId ? { not: excludeId } : undefined
            },
            orderBy: { publishAt: 'desc' }
        })
    }

    /**
     * Cherche l'article à la une pour un tag donné
     */
    static async fetchExplicitFeaturedPostByTag(tag: string) {
        return await this.db.post.findFirst({
            where: {
                status: 'PUBLISHED',
                isFeatured: true,
                tags: { has: tag }
            },
            orderBy: { publishAt: 'desc' }
        })
    }

    /**
     * Fallback : dernier article publié pour un tag donné
     */
    static async fetchLatestPostByTag(tag: string) {
        return await this.db.post.findFirst({
            where: {
                status: 'PUBLISHED',
                tags: { has: tag }
            },
            orderBy: { publishAt: 'desc' }
        })
    }

    /**
     * Recommandations : Algorithme des articles similaires par tags partagés
     * avec repli automatique (fallback) sur les derniers articles publiés
     */
    static async fetchSimilarPosts(currentPostId: string, tags: string[], limit = 3) {
        let similarPosts: any[] = []

        // 1. Recherche prioritaire par tags partagés
        if (tags && tags.length > 0) {
            similarPosts = await this.db.post.findMany({
                where: {
                    status: 'PUBLISHED',
                    id: { not: currentPostId },
                    tags: { hasSome: tags }
                },
                orderBy: { publishAt: 'desc' },
                take: limit
            })
        }

        // Si le quota de 3 articles est atteint, on retourne directement
        if (similarPosts.length >= limit) {
            return similarPosts
        }

        // 2. Fallback : on complète avec les derniers articles publiés
        const needed = limit - similarPosts.length
        const excludeIds = [currentPostId, ...similarPosts.map(p => p.id)]

        const fallbackPosts = await this.db.post.findMany({
            where: {
                status: 'PUBLISHED',
                id: { notIn: excludeIds }
            },
            orderBy: { publishAt: 'desc' },
            take: needed
        })

        return [...similarPosts, ...fallbackPosts]
    }

    /**
     * Liste unique de tous les tags existants (utilisé pour les filtres et badges)
     */
    static async fetchUniqueTags(): Promise<string[]> {
        const posts = await this.db.post.findMany({
            where: { status: 'PUBLISHED' },
            select: { tags: true } // Optimisation : sélectionne uniquement la colonne tags
        })

        const allTags = posts.flatMap(p => p.tags)
        return Array.from(new Set(allTags)).sort()
    }


    // =========================================================================
    // 🛠️ 2. REQUÊTES ADMIN (EXTRANET / BACK-OFFICE RÉDACTION)
    // Accès étendu : brouillons, programmations, corbeille et mutations
    // =========================================================================

    /**
     * Récupère tous les articles non purgés pour le tableau de bord de l'extranet
     * (Exclut uniquement les éléments de la corbeille DELETED)
     */
    static async fetchAllAdminPosts() {
        return await this.db.post.findMany({
            where: {
                status: {
                    not: 'DELETED'
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    }

    /**
     * Récupère un article par son ID technique (pour l'éditeur de l'extranet)
     */
    static async fetchPostById(id: string) {
        return await this.db.post.findUnique({
            where: { id }
        })
    }

    /**
     * Récupère un article par slug pour l'admin (y compris si DRAFT pour la prévisualisation)
     */
    static async fetchPostBySlug(slug: string) {
        return await this.db.post.findUnique({
            where: { slug }
        })
    }

    /**
     * Création d'un article : insertion directe des données issues du FormBean/Mapper
     */
    static async createPost(payload: EditPost) {
        return await this.db.post.create({
            data: payload.post as any
        })
    }

    /**
     * Modification d'un article : omet scrupuleusement l'id et le slug pour sanctuariser les permaliens
     */
    static async updatePost(id: string, payload: EditPost) {
        const { id: _, slug: __, ...postData } = payload.post

        return await this.db.post.update({
            where: { id },
            data: postData as any
        })
    }

    /**
     * Soft delete : déplace l'article dans la corbeille sans le détruire
     */
    static async softDeletePost(id: string) {
        return await this.db.post.update({
            where: { id },
            data: { status: 'DELETED' }
        })
    }

    /**
     * Audit de maintenance : récupère le contenu JSON de tous les posts
     * (Utilisé par les action-support pour détecter les fichiers orphelins)
     */
    static async getPostsContents() {
        return await this.db.post.findMany({
            select: { content: true }
        })
    }
}