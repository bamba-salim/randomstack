import type {
    FeaturedPostListed,
    PublicPostListed,
    AdminPostListed,
    PublicPostDetail,
    PublishedPostsResponse,
    SavePostResponse,
    EditPost,
    EditPostFormBean,
    PostStatus
} from '@randomstack/commons'
import {StrUtils} from '#utils'

export default class BlogMapper {

    static buildFeaturedPostListed(post: any): FeaturedPostListed {
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

    static buildPublicPostListed(post: any): PublicPostListed {
        return {
            id: post.id,
            slug: post.slug,
            title: post.title,
            mainTag: post.tags?.[0] || '',
            image: post.imageId,
            publishAt: post.publishAt || post.updatedAt
        }
    }

    static buildPublicPostListedList(posts: any[]): PublicPostListed[] {
        return posts.map(post => this.buildPublicPostListed(post))
    }

    static buildPublicPostDetail(post: any): PublicPostDetail {
        return {
            id: post.id,
            slug: post.slug,
            title: post.title,
            summary: post.summary,
            content: post.content || [],
            imageId: post.imageId,
            tags: post.tags || [],
            mainTag: post.tags?.[0] || '',
            publishAt: post.publishAt || post.updatedAt
        }
    }

    static buildAdminPostListed(post: any): AdminPostListed {
        return {
            id: post.id,
            title: post.title,
            status: post.status,
            tags: post.tags || [],
            imageId: post.imageId,
            publishAt: post.publishAt
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

    static toSavePostDTO(formBean: EditPostFormBean, idPost: string): EditPost {
        const slug = StrUtils.slugify(formBean.title, idPost)

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

        let tagsList: string[] = []
        const rawTags = formBean.tags as unknown

        if (Array.isArray(rawTags)) {
            tagsList = rawTags.map(t => String(t).trim()).filter(Boolean)
        } else if (typeof rawTags === 'string' && rawTags.trim() !== '') {
            tagsList = rawTags.split(',').map((t: string) => t.trim()).filter(Boolean)
        }

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
                hasBeenPublished: formBean.hasBeenPublished === true,
                isFeatured: Boolean(formBean.isFeatured)
            }
        }
    }

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
            isFeatured: post.isFeatured
        }
    }

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
