import type {BlockType, PostStatus} from '../../constants'

export interface PostContentBlock {
    type: BlockType
    value: string
    caption?: string | null
    language?: string | null
    left?: PostContentBlock | null
    right?: PostContentBlock | null
}

/** Entité DB Post */
export interface Post {
    id: string
    title: string
    slug: string
    summary: string
    content: PostContentBlock[]
    imageId: string | null
    status: PostStatus
    tags: string[]
    hasBeenPublished: boolean
    isFeatured: boolean
    authorIds: string[]
    publishAt: string | Date | null
    createdAt: string | Date
    updatedAt: string | Date
}

/** Contrat d'écriture serveur */
export interface EditPost {
    post: Omit<Post, 'createdAt' | 'updatedAt'>
}
