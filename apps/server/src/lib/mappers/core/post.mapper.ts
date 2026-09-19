import type {
    EditPost,
    EditPostFormBean,
    EditFile,
    PostStatus,
    FileType,
    Table,
    FILE_TYPE,
    TABLE,
} from '@randomstack/commons'
import {StrUtils} from "#utils"

export default class PostMapper {
    // Convertit req.body brut en DTO d'écriture propre avec slug immuable 🚀
    static toSavePostDTO(formBean: EditPostFormBean, idPost: string): EditPost {
        const slug = StrUtils.slugify(formBean.title, idPost)

        // Parsing du tableau de blocs JSON complexe de FormData
        let contentBlocks = []

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

        // TODO: use input for tags use tags from other post
        const rawTags = formBean.tags

        if (Array.isArray(rawTags)) {
            tagsList = rawTags.map(t => String(t).trim()).filter(Boolean)
        } else if (typeof rawTags === 'string' && rawTags.trim() !== '') {
            tagsList = rawTags.split(',').map(t => t.trim()).filter(Boolean)
        }

        return {
            post: {
                id: idPost,
                title: String(formBean.title || '').trim(),
                slug,
                summary: String(formBean.summary || '').trim(),
                content: contentBlocks,
                imageId: formBean.imageId,
                status: (formBean.status as PostStatus) || 'DRAFT',
                tags: tagsList,
                authorIds: Array.isArray(formBean.authorIds) ? formBean.authorIds : [],
                publishAt: formBean.publishAt ? new Date(formBean.publishAt) : null,
                hasBeenPublished: formBean.hasBeenPublished === 'true' || formBean.hasBeenPublished === true
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
            imageId: post.imageId,
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
            imageId: null,
            status: 'DRAFT',
            tags: [],
            authorIds: [],
            publishAt: null,
            hasBeenPublished: false,
            logo: null
        }
    }

}