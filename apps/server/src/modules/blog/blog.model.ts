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
    static async fetchPublishedPostByShareCode(shareCode: string) {
        return await this.db.post.findFirst({
            where: {
                shareCode: shareCode.toUpperCase(),
                status: 'PUBLISHED'
            },
            include: {
                _count: {select: {comments: true}}
            }
        })
    }

    static async fetchPublishedPostBySlug(slug: string) {
        return await this.db.post.findFirst({
            where: {
                slug,
                status: 'PUBLISHED'
            },
            include: {
                _count: {select: {comments: true}}
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
    static async fetchSimilarPosts(currentPostId: string, tags: string[], limit = 4) {
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

        // Si le quota est atteint, on retourne directement
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

    /** Articles publiés d'un auteur */
    static async fetchPublishedPostsByAuthor(authorId: string, excludePostId?: string, limit = 4) {
        return await this.db.post.findMany({
            where: {
                status: 'PUBLISHED',
                authorId,
                id: excludePostId ? {not: excludePostId} : undefined
            },
            orderBy: {publishAt: 'desc'},
            take: limit
        })
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
     * Articles extranet. `includeDeleted` : corbeille visible (filtre UI).
     * Si `authorId` (AUTHOR) : restreint à ses articles.
     */
    static async fetchAllAdminPosts(authorId?: string, includeDeleted = true) {
        return await this.db.post.findMany({
            where: {
                ...(includeDeleted ? {} : {status: {not: 'DELETED'}}),
                ...(authorId ? {authorId} : {})
            },
            include: {
                author: {
                    select: {
                        id: true,
                        profile: {select: {displayName: true}}
                    }
                }
            },
            orderBy: {createdAt: 'desc'}
        })
    }

    /** Un seul article à la une : désépingle tous les autres */
    static async clearOtherFeatured(exceptPostId: string) {
        return await this.db.post.updateMany({
            where: {
                isFeatured: true,
                id: {not: exceptPostId}
            },
            data: {isFeatured: false}
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
            where: {slug},
            include: {
                _count: {select: {comments: true}}
            }
        })
    }

    /** Lecture publique / preview par shareCode (permalien). */
    static async fetchPostByShareCode(shareCode: string) {
        return await this.db.post.findUnique({
            where: {shareCode: shareCode.toUpperCase()},
            include: {
                _count: {select: {comments: true}}
            }
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

    /** True si un autre article utilise déjà ce slug. */
    static async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
        const found = await this.db.post.findFirst({
            where: {
                slug,
                ...(excludeId ? {id: {not: excludeId}} : {})
            },
            select: {id: true}
        })
        return Boolean(found)
    }

    /**
     * Modification : slug modifiable, shareCode (permalien) jamais touché.
     */
    static async updatePost(id: string, payload: EditPost) {
        const {id: _id, shareCode: _shareCode, ...postData} = payload.post

        return await this.db.post.update({
            where: {id},
            data: postData as any
        })
    }

    /** Soft delete → corbeille (purge hard après 90j via cron). */
    static async softDeletePost(id: string) {
        return await this.db.post.update({
            where: {id},
            data: {
                status: 'DELETED',
                deletedAt: new Date(),
                isFeatured: false
            }
        })
    }

    /** Suppression définitive (ADMIN uniquement). */
    static async hardDeletePost(id: string) {
        return await this.db.post.delete({where: {id}})
    }

    /** Posts soft-deleted depuis plus de `olderThan`. */
    static async fetchExpiredSoftDeleted(olderThan: Date) {
        return await this.db.post.findMany({
            where: {
                status: 'DELETED',
                deletedAt: {lt: olderThan, not: null}
            },
            select: {id: true, imageId: true, content: true}
        })
    }

    /** Publie les articles planifiés dont publishAt est passé. */
    static async publishDueScheduled() {
        return await this.db.post.updateMany({
            where: {
                status: 'SCHEDULED',
                publishAt: {lte: new Date()}
            },
            data: {
                status: 'PUBLISHED',
                hasBeenPublished: true
            }
        })
    }

    /** Audit admin : contenus JSON de tous les posts. */
    static async getPostsContents() {
        return await this.db.post.findMany({
            select: {content: true}
        })
    }
}