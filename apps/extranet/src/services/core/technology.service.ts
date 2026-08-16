import ApiClient from '../api.client.js'

import type { Technology } from '@randomstack/commons'


export default class TechnologyService extends ApiClient {

    static async fetchAll(): Promise<Technology[]> {
        return await this.get<Technology[]>('/api/fetch-technologies')
    }

    static async fetchById(id: string): Promise<Technology> {
        return await this.get<Technology>(`/api/fetch-technology/${id}`) // Route RPC 🚀
    }

    static async fetchTechnologyFormData(id?: string): Promise<{ success: boolean }> {
        return await this.get<{ success: boolean }>(`/api/admin/fetch-technology-form-data${id ? `/${id}` : ''}`)
    }

    // Utilisation de la méthode générique postForm de la classe mère ApiClient 🚀
    static async save(formData: FormData, id?: string): Promise<{ success: boolean; technology: Technology }> {
        const endpoint = id ? `/api/admin/save-technology/${id}` : '/api/admin/save-technology'
        return await this.postForm<{ success: boolean; technology: Technology }>(endpoint, formData)
    }
    
}