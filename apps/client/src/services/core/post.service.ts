import ApiClient from './api.client.js'
import type { Post } from '@randomstack/commons'

export default class PostService extends ApiClient {
    // Récupère l'article sémantiquement par son slug, avec option de prévisualisation sécurisée 🚀
    static async fetchBySlug(slug: string, isPreview: boolean = false): Promise<Post> {
        const query = isPreview ? '?preview=true' : ''
        return await this.get<Post>(`/api/posts/fetch-post/${slug}${query}`)
    }
}