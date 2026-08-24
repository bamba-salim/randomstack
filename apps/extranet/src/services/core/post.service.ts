import ApiClient from '../api.client.js'
import type {EditPostFormBean, Post} from '@randomstack/commons'

export default class PostService extends ApiClient {
    // Charge ou initialise le FormBean de manière unifiée depuis l'API 🚀
    static async fetchPostFormData(id?: string): Promise<EditPostFormBean> {
        return await this.get<EditPostFormBean>(`/api/admin/fetch-post-form-data${id ? `/${id}` : ''}`)
    }

    static async fetchAll(): Promise<Post[]> {
        const posts =  await this.get<Post[]>('/api/fetch-posts')
        console.log(posts)
        return posts
    }

    // Écrit en BDD (Création ou Édition) de manière sémantique
    static async save(formData: FormData, id?: string): Promise<{ success: boolean; post: Post }> {
        const endpoint = `/api/admin/save-post${id ? `/${id}` : ''}`
        return await this.postForm<{ success: boolean; post: Post }>(endpoint, formData)
    }
}