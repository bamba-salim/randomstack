import {Database} from '#db'

import type {EditPost} from '@randomstack/commons'

export default class PostModel {

    static async fetchAllPosts(): Promise<number> {
        return await Database.client.post.findMany({
            where: {
                status: {
                    not: 'DELETED'
                }
            },
            orderBy: {createdAt: 'desc'}
        })
    }

    static async fetchPublishedPost() {
        return await Database.client.post.findMany({
            where: {status: 'PUBLISHED'},
            orderBy: {publishedAt: 'desc'}
        })
    }

    static async fetchPosts() {
        return await Database.client.post.findMany({
            orderBy: {createdAt: 'desc'}
        })
    }

    static async fetchPostById(id: string) {
        return await Database.client.post.findUnique({
            where: {id}
        })
    }

    static async fetchPostBySlug(slug: string) {
        return await Database.client.post.findUnique({
            where: {slug}
        })
    }


    // Création : reçoit directement l'objet du mapper 🚀
    static async createPost(payload: EditPost) {
        return await Database.client.post.create({
            data: payload.post as any
        })
    }

    // Modification : reçoit l'objet du mapper et omet l'id et le slug pour garantir les permaliens 🚀
    static async updatePost(id: string, payload: EditPost) {
        const {id: _, slug: __, ...postData} = payload.post

        return await Database.client.post.update({
            where: {id},
            data: postData as any
        })
    }

    static async getPostsContents() {
        return await Database.client.post.findMany({
            select: {content: true}
        })
    }

    static async fetchUniqueTags(): Promise<string[]> {
        const posts = await Database.client.post.findMany({
            select: {tags: true} // Ne récupère QUE cette colonne, ignore le contenu lourd !
        })

        // Aplatit le tableau de tableaux en un seul tableau et supprime les doublons
        const allTags = posts.flatMap(p => p.tags)
        return Array.from(new Set(allTags)).sort()
    }

    // 1. Cherche l'article explicitement mis en avant par l'admin 🚀
    static async fetchExplicitFeaturedPost() {
        return await Database.client.post.findFirst({
            where: { status: 'PUBLISHED', isFeatured: true },
            orderBy: { publishAt: 'desc' }
        })
    }

    // 2. Cherche l'article publié le plus récent 🚀
    static async fetchLatestPost() {
        return await Database.client.post.findFirst({
            where: { status: 'PUBLISHED' },
            orderBy: { publishAt: 'desc' }
        })
    }

    // 3. Récupère la liste des articles (en excluant l'article à la une) 🚀
    static async fetchPublishedPosts(excludeId?: string) {
        return await Database.client.post.findMany({
            where: {
                status: 'PUBLISHED',
                id: excludeId ? { not: excludeId } : undefined
            },
            orderBy: { publishAt: 'desc' }
        })
    }
}