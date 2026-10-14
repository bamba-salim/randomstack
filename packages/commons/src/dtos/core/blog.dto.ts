import type {PostStatus} from '../../constants'
import type {PostContentBlock} from '../../interfaces/core/post.interface'

/** Formulaire création / édition article (extranet) */
export interface EditPostFormBean {
    id?: string
    title: string
    /** Généré côté serveur à la sauvegarde (pas saisi en UI). */
    slug?: string
    /** Permalien — jamais exposé en édition UI. */
    shareCode?: string
    summary: string
    content: PostContentBlock[]
    imageId?: string | null
    status: PostStatus
    tags: string[]
    /** Sources / crédits (texte libre, comme les tags sans suggestions). */
    sources: string[]
    /** Rempli à la création ; modifiable uniquement par ADMIN */
    authorId: string | null
    publishAt?: string | null
    hasBeenPublished?: boolean
    isFeatured: boolean
}

/** Liste publique (grille blog / similar) — URL canonique : `/{mainTag}/{slug}` */
export interface PublicPostListed {
    id: string
    slug: string
    shareCode: string
    title: string
    image: string | null
    mainTag: string
    publishAt: string | Date | null
}

/** Liste à la une (home) */
export interface FeaturedPostListed {
    id: string
    slug: string
    shareCode: string
    title: string
    summary: string
    image: string | null
    mainTag: string
    publishAt: string | Date | null
}

/** Page / résolution du lien de partage `/post/:shareCode` */
export interface PostShareResolved {
    shareCode: string
    slug: string
    mainTag: string
    title: string
    summary: string
    image: string | null
    publishAt: string | Date | null
}

/** Table admin extranet */
export interface AdminPostListed {
    id: string
    title: string
    status: PostStatus
    tags: string[]
    imageId: string | null
    publishAt?: string | null
    shareCode?: string
}

/** Auteur exposé sur la fiche article */
export interface AuthorListed {
    id: string
    displayName: string
    bio: string | null
    photoId: string | null
}

/** Page article publique */
export interface PublicPostDetail {
    id: string
    slug: string
    shareCode: string
    title: string
    summary: string
    content: PostContentBlock[]
    imageId: string | null
    tags: string[]
    sources: string[]
    mainTag: string
    publishAt: string | Date | null
    author: AuthorListed | null
    commentsCount: number
    isFavorite?: boolean
    /** true si chargé en mode prévisualisation staff */
    isPreview?: boolean
}

export interface PublishedPostsResponse {
    featured: FeaturedPostListed | null
    posts: PublicPostListed[]
}

/** Réponse save article (admin) */
export interface SavePostResponse {
    success: true
    post: AdminPostListed
}
