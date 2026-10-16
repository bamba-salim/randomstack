import type {
    AuthorListed,
    FeaturedPostListed,
    PublicPostListed,
    AdminPostListed,
    PublicPostDetail,
    PostShareResolved,
    PublishedPostsResponse,
    SavePostResponse,
    EditPost,
    EditPostFormBean,
    PostStatus
} from '@randomstack/commons'
import {StrUtils} from '#utils'

export default class BlogMapper {

    static buildAuthorListed(profile: {
        id: string
        displayName: string
        bio: string | null
        photoId: string | null
    }): AuthorListed {
        return {
            id: profile.id,
            displayName: profile.displayName,
            bio: profile.bio,
            photoId: profile.photoId
        }
    }

    static buildFeaturedPostListed(post: any): FeaturedPostListed {
        return {
            id: post.id,
            slug: post.slug,
            shareCode: post.shareCode,
            title: post.title,
            summary: post.summary,
            mainTag: post.tags?.[0] || '',
            image: post.imageId,
            publishAt: post.publishAt || post.updatedAt
        }
    }

    static buildPublicPostListed(post: any): PublicPostListed {
        return {
            id: post.id,
            slug: post.slug,
            shareCode: post.shareCode,
            title: post.title,
            mainTag: post.tags?.[0] || '',
            image: post.imageId,
            publishAt: post.publishAt || post.updatedAt
        }
    }

    /** Données page de partage `/post/:shareCode`. */
    static buildPostShareResolved(post: any): PostShareResolved {
        return {
            shareCode: post.shareCode,
            slug: post.slug,
            mainTag: post.tags?.[0] || 'post',
            title: post.title,
            summary: post.summary || '',
            image: post.imageId || null,
            publishAt: post.publishAt || post.updatedAt || null
        }
    }

    static buildPublicPostListedList(posts: any[]): PublicPostListed[] {
        return posts.map(post => this.buildPublicPostListed(post))
    }

    static buildPublicPostDetail(
        post: any,
        author: AuthorListed | null = null,
        isFavorite = false,
        isPreview = false
    ): PublicPostDetail {
        return {
            id: post.id,
            slug: post.slug,
            shareCode: post.shareCode,
            title: post.title,
            summary: post.summary,
            content: post.content || [],
            imageId: post.imageId,
            imageCaption: post.imageCaption || null,
            tags: post.tags || [],
            sources: post.sources || [],
            mainTag: post.tags?.[0] || '',
            publishAt: post.publishAt || post.updatedAt,
            author,
            commentsCount: post._count?.comments ?? post.commentsCount ?? 0,
            isFavorite,
            isPreview
        }
    }

    static buildAdminPostListed(post: any): AdminPostListed {
        return {
            id: post.id,
            title: post.title,
            summary: post.summary || '',
            status: post.status,
            tags: post.tags || [],
            imageId: post.imageId,
            publishAt: post.publishAt,
            shareCode: post.shareCode,
            authorId: post.authorId ?? post.author?.id ?? null,
            authorName: post.author?.profile?.displayName ?? null
        }
    }

    static buildAdminPostListedList(posts: any[]): AdminPostListed[] {
        return posts.map(post => this.buildAdminPostListed(post))
    }

    static buildPublishedPostsResponse(
        featured: any | null,
        posts: any[]
    ): PublishedPostsResponse {
        return {
            featured: featured ? this.buildFeaturedPostListed(featured) : null,
            posts: this.buildPublicPostListedList(posts)
        }
    }

    static buildSavePostResponse(post: any): SavePostResponse {
        return {
            success: true,
            post: this.buildAdminPostListed(post)
        }
    }

    private static normalizeStringList(raw: unknown): string[] {
        if (Array.isArray(raw)) {
            return raw.map(t => String(t).trim()).filter(Boolean)
        }
        if (typeof raw === 'string' && raw.trim() !== '') {
            return raw.split(',').map(t => t.trim()).filter(Boolean)
        }
        return []
    }

    static toSavePostDTO(
        formBean: EditPostFormBean,
        idPost: string,
        authorId: string | null,
        shareCode?: string
    ): EditPost {
        const title = String(formBean.title || '').trim()
        // Slug toujours dérivé du titre à la sauvegarde (unique via id)
        const slug = StrUtils.slugify(title, idPost)

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

        const tagsList = this.normalizeStringList(formBean.tags)
        const sourcesList = this.normalizeStringList(formBean.sources)

        const status = (formBean.status as PostStatus) || 'DRAFT'
        let finalPublishAt = formBean.publishAt ? new Date(formBean.publishAt) : null

        if (status === 'PUBLISHED' && !finalPublishAt) {
            finalPublishAt = new Date()
        }

        return {
            post: {
                id: idPost,
                title,
                slug,
                shareCode: shareCode || StrUtils.shareCode(),
                summary: String(formBean.summary || '').trim(),
                content: contentBlocks,
                imageId: formBean.imageId || null,
                imageCaption: formBean.imageCaption?.trim() || null,
                status,
                tags: tagsList,
                sources: sourcesList,
                authorId,
                publishAt: finalPublishAt,
                hasBeenPublished: formBean.hasBeenPublished === true,
                isFeatured: Boolean(formBean.isFeatured),
                deletedAt: null
            }
        }
    }

    static fromDBToClientFormBean(post: any): EditPostFormBean {
        return {
            id: post.id,
            title: post.title,
            slug: post.slug,
            shareCode: post.shareCode,
            summary: post.summary,
            content: post.content,
            imageId: post.imageId || null,
            imageCaption: post.imageCaption || null,
            status: post.status,
            tags: post.tags || [],
            sources: post.sources || [],
            authorId: post.authorId || null,
            publishAt: post.publishAt ? new Date(post.publishAt).toISOString() : null,
            hasBeenPublished: post.hasBeenPublished,
            isFeatured: post.isFeatured
        }
    }

    static getInitialFormBean(): EditPostFormBean {
        return {
            title: '',
            summary: '',
            content: [],
            imageId: null,
            imageCaption: null,
            status: 'DRAFT',
            tags: [],
            sources: [],
            authorId: null,
            publishAt: null,
            hasBeenPublished: false,
            isFeatured: false
        }
    }

    static buildUniqueTags(tags: string[]): string[] {
        return Array.isArray(tags) ? tags : []
    }

    static buildPostsContentsAudit(imageBlocks: any[]): {size: number; data: any[]} {
        return {
            size: imageBlocks.length,
            data: imageBlocks
        }
    }

    static buildSuccessAck(): {success: true} {
        return {success: true}
    }
}
