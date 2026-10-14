import type {PostStatus} from '../../constants'
import type {PostContentBlock} from '../../interfaces/core/post.interface'

/** Formulaire création / édition article (extranet) */
export interface EditPostFormBean {
    id?: string
    title: string
    /**
     * Segment d’URL canonique `/{tag}/{slug}` — modifiable.
     * Vide à la création → généré depuis le titre.
     */
    slug?: string
    /**
     * Permalien de partage `/post/{shareCode}` — lecture seule (jamais modifié).
     */
    shareCode?: string
    summary: string
    content: PostContentBlock[]
    imageId?: string | null
    status: PostStatus
    tags: string[]
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
    /** Lien de partage : `/post/{shareCode}` → redirige vers le slug */
    shareCode: string
    title: string
    image: string | null
    mainTag: string
    publishAt: string | Date | null
}

/** Liste à la une (home) — URL canonique : `/{mainTag}/{slug}` */
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
}

/** Auteur exposé sur la fiche article (card + articles associés) */
export interface AuthorListed {
    id: string
    displayName: string
    bio: string | null
    photoId: string | null
}

/** Page article publique — URL canonique : `/{mainTag}/{slug}` */
export interface PublicPostDetail {
    id: string
    slug: string
    shareCode: string
    title: string
    summary: string
    content: PostContentBlock[]
    imageId: string | null
    tags: string[]
    mainTag: string
    publishAt: string | Date | null
    author: AuthorListed | null
    commentsCount: number
    /** Présent si l'utilisateur est connecté */
    isFavorite?: boolean
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