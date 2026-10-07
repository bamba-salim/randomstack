import type {
    Post,
    FeaturedPost,
    ListedPost,
    AdminPostList,
    EditPost,
    EditPostFormBean,
    PostStatus,
} from '@randomstack/commons'
import { StrUtils } from '#utils'

export default class BlogMapper {

    // =========================================================================
    // 🌐 1. OUTBOUND DTOs (LECTURE PUBLIQUE & LISTING ADMIN)
    // Transforme les entités BDD lourdes en DTOs légers pour les frontends
    // =========================================================================

    /**
     * Construit le DTO de l'article mis en avant pour le blog / home
     */
    static buildFeaturedPost(post: Post): FeaturedPost {
        return {
            id: post.id,
            slug: post.slug,
            title: post.title,
            summary: post.summary,
            mainTag: post.tags?.[0] || '',
            image: post.imageId,
            publishAt: post.publishAt || post.updatedAt
        }
    }

    /**
     * Construit le DTO unitaire d'un article pour les grilles standard (Client)
     */
    static buildListedPost(post: Post): ListedPost {
        return {
            id: post.id,
            slug: post.slug,
            title: post.title,
            mainTag: post.tags?.[0] || '',
            image: post.imageId,
            publishAt: post.publishAt || post.updatedAt
        }
    }

    /**
     * Mappe une liste complète d'articles pour les grilles publiques
     */
    static buildListedPostList(posts: Post[]): ListedPost[] {
        return posts.map(post => this.buildListedPost(post))
    }

    /**
     * Mappe un article pour le tableau de bord de l'Extranet (Admin)
     */
    static buildAdminPost(post: Post): AdminPostList {
        return {
            id: post.id,
            title: post.title,
            status: post.status,
            tags: post.tags || [],
            imageId: post.imageId,
            publishAt: post.publishAt
        }
    }

    /**
     * Mappe l'ensemble des articles pour l'index de l'Extranet
     */
    static buildAdminPostList(posts: Post[]): AdminPostList[] {
        return posts.map(post => this.buildAdminPost(post))
    }


    // =========================================================================
    // 🛠️ 2. INBOUND & FORMBEANS (ÉDITION & ÉCRITURE EXTRANET)
    // Gestion du FormBean d'édition et transformation vers la couche BDD
    // =========================================================================

    /**
     * Convertit le FormBean reçu du client (req.body) en DTO d'écriture BDD (EditPost)
     * Génère un permalien (slug) stable et immuable basé sur le titre et l'ID
     */
    static toSavePostDTO(formBean: EditPostFormBean, idPost: string): EditPost {
        const slug = StrUtils.slugify(formBean.title, idPost)

        // 1. Parsing sécurisé des blocs de contenu JSON (provenant souvent d'un FormData)
        let contentBlocks: any[] = []
        if (typeof formBean.content === 'string') {
            try {
                contentBlocks = JSON.parse(formBean.content)
            } catch {
                contentBlocks = []
            }
        } else if (Array.isArray(formBean.content)) {
            contentBlocks = formBean.content
        }

        // 2. Normalisation des tags (tableau ou chaîne séparée par des virgules)
        let tagsList: string[] = []
        const rawTags = formBean.tags

        if (Array.isArray(rawTags)) {
            tagsList = rawTags.map(t => String(t).trim()).filter(Boolean)
        } else if (typeof rawTags === 'string' && rawTags.trim() !== '') {
            tagsList = rawTags.split(',').map(t => t.trim()).filter(Boolean)
        }

        // 3. Détermination du statut et de la date de publication
        const status = (formBean.status as PostStatus) || 'DRAFT'
        let finalPublishAt = formBean.publishAt ? new Date(formBean.publishAt) : null

        if (status === 'PUBLISHED' && !finalPublishAt) {
            finalPublishAt = new Date()
        }

        return {
            post: {
                id: idPost,
                title: String(formBean.title || '').trim(),
                slug,
                summary: String(formBean.summary || '').trim(),
                content: contentBlocks,
                imageId: formBean.imageId || null,
                status,
                tags: tagsList,
                authorIds: Array.isArray(formBean.authorIds) ? formBean.authorIds : [],
                publishAt: finalPublishAt,
                hasBeenPublished: formBean.hasBeenPublished === 'true' || formBean.hasBeenPublished === true,
                isFeatured: Boolean(formBean.isFeatured)
            }
        }
    }

    /**
     * Hydrate le FormBean d'édition pour l'Extranet à partir des données de la BDD
     */
    static fromDBToClientFormBean(post: any): EditPostFormBean {
        return {
            id: post.id,
            title: post.title,
            summary: post.summary,
            content: post.content,
            imageId: post.imageId || null,
            status: post.status,
            tags: post.tags || [],
            authorIds: post.authorIds || [],
            publishAt: post.publishAt ? new Date(post.publishAt).toISOString() : null,
            hasBeenPublished: post.hasBeenPublished,
            isFeatured: post.isFeatured,
            logo: null
        }
    }

    /**
     * Génère un FormBean vierge pour l'initialisation du formulaire de création
     */
    static getInitialFormBean(): EditPostFormBean {
        return {
            title: '',
            summary: '',
            content: [],
            imageId: null,
            status: 'DRAFT',
            tags: [],
            authorIds: [],
            publishAt: null,
            hasBeenPublished: false,
            isFeatured: false,
            logo: null
        }
    }
}