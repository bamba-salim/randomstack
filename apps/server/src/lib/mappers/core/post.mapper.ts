import type {EditPost, EditPostFormBean, FileType, EditFile, PostStatus, Table, FILE_TYPE, TABLE} from '@randomstack/commons'

export default class PostMapper {
    // Convertit req.body brut en DTO d'écriture propre avec slug immuable 🚀
    static toSavePostDTO(rawBody: any, imageId: string | null, targetId: string): EditPost {
        const kebabTitle = String(rawBody.title || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        const slug = `${kebabTitle}-${targetId}`

        // Parsing du tableau de blocs JSON complexe de FormData
        let contentBlocks = []
        if (typeof rawBody.content === 'string') {
            try {
                contentBlocks = JSON.parse(rawBody.content)
            } catch {
                contentBlocks = []
            }
        } else if (Array.isArray(rawBody.content)) {
            contentBlocks = rawBody.content
        }

        let tagsList: string[] = []
        const rawTags = rawBody.tags
        if (Array.isArray(rawTags)) {
            tagsList = rawTags.map(t => String(t).trim()).filter(Boolean)
        } else if (typeof rawTags === 'string' && rawTags.trim() !== '') {
            tagsList = rawTags.split(',').map(t => t.trim()).filter(Boolean)
        }

        return {
            post: {
                id: targetId,
                title: String(rawBody.title || '').trim(),
                slug,
                summary: String(rawBody.summary || '').trim(),
                content: contentBlocks,
                imageId: imageId,
                status: (rawBody.status as PostStatus) || 'DRAFT',
                tags: tagsList,
                authorIds: Array.isArray(rawBody.authorIds) ? rawBody.authorIds : [],
                publishAt: rawBody.publishAt ? new Date(rawBody.publishAt) : null,
                hasBeenPublished: rawBody.hasBeenPublished === 'true' || rawBody.hasBeenPublished === true
            }
        }
    }

    // Aplatit pour le FormBean d'édition de l'Extranet d'administration 🚀
    static fromDBToClientFormBean(post: any): EditPostFormBean {
        return {
            id: post.id,
            title: post.title,
            summary: post.summary,
            content: post.content,
            imageUrl: post.imageUrl,
            status: post.status,
            tags: post.tags || [],
            authorIds: post.authorIds,
            publishAt: post.publishAt ? new Date(post.publishAt).toISOString() : null,
            hasBeenPublished: post.hasBeenPublished
        }
    }

    // Génère la structure initiale vide (FormBean) pour une création 🚀
    static getInitialFormBean(): EditPostFormBean {
        return {
            title: '',
            summary: '',
            content: [],
            imageUrl: null,
            status: 'DRAFT',
            tags: [],
            authorIds: [],
            publishAt: null,
            hasBeenPublished: false,
            logo: null
        }
    }


    static toSavePostImage(targetId, type, ext, mimeType, size, altText): EditFile {
        return {
            file: {
                id: targetId,
                type: FILE_TYPE.IMAGE,
                category: TABLE.POST,
                extension: ext,
                mimeType: mimeType,
                size: size,
                altText: altText | null,
            }
        }
    }
}