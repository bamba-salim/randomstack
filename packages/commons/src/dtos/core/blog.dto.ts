import type {PostStatus} from '../../constants'
import type {PostContentBlock} from '../../interfaces'

/** Formulaire création / édition article (extranet) */
export interface EditPostFormBean {
    id?: string
    title: string
    summary: string
    content: PostContentBlock[]
    imageId?: string | null
    status: PostStatus
    tags: string[]
    authorIds: string[]
    publishAt?: string | null
    hasBeenPublished?: boolean
    isFeatured: boolean
}

/** Liste publique (grille blog / similar) */
export interface PublicPostListed {
    id: string
    slug: string
    title: string
    image: string | null
    mainTag: string
    publishAt: string | Date | null
}

/** Liste à la une (home) */
export interface FeaturedPostListed {
    id: string
    slug: string
    title: string
    summary: string
    image: string | null
    mainTag: string
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

/** Page article publique */
export interface PublicPostDetail {
    id: string
    slug: string
    title: string
    summary: string
    content: PostContentBlock[]
    imageId: string | null
    tags: string[]
    mainTag: string
    publishAt: string | Date | null
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