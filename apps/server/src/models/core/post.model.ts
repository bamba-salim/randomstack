import { Database } from '#db'

import type { EditPost  } from '@randomstack/commons'

export default class PostModel {

    static async fetchAllPosts(): Promise<number> {
        return await Database.client.post.findMany({
            where: { status: {
                not: 'DELETED'
                } }
        })
    }

    static async fetchPublishedPost(){
        return await Database.client.post.findMany({
            where: { status: 'PUBLISHED' }
        })
    }

    static async fetchPosts() {
        return await Database.client.post.findMany({
            orderBy: { createdAt: 'desc' }
        })
    }

    static async fetchPostById(id: string) {
        return await Database.client.post.findUnique({
            where: { id }
        })
    }

    static async fetchPostBySlug(slug: string) {
        return await Database.client.post.findUnique({
            where: { slug }
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
        const { id: _, slug: __, ...postData } = payload.post

        return await Database.client.post.update({
            where: { id },
            data: postData as any
        })
    }
}