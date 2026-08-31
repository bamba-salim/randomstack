import {BlockType, PostStatus} from '../../types'

export interface PostContentBlock {
    type: BlockType
    value: string
    caption?: string | null
    language?: string | null
    left?: PostContentBlock | null
    right?: PostContentBlock | null
}

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
    authorIds: string[]
    publishAt: string | Date | null
    createdAt: string | Date
    updatedAt: string | Date
}

// Le contrat double-DTO d'écriture serveur
export interface EditPost {
    post: Omit<Post, 'createdAt' | 'updatedAt'>
}

// Le FormBean unifié utilisé par le formulaire de l'Extranet 🚀
export interface EditPostFormBean {
    id?: string
    title: string
    summary: string
    content: PostContentBlock[]
    imageId?: string | null
    imageUrl: string | null
    status: PostStatus
    tags: string[]
    authorIds: string[]
    publishAt?: string | null
    hasBeenPublished?: boolean
}