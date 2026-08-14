import ApiClient from '../api.client.ts'

import type {Technology, Category, DrawnStack, DrawResponse} from '@randomstack/commons'


export default class StackService extends ApiClient {

    //TODO: use inputs or dtos
    // Envoi des verrous et de la blacklist sous forme d'IDs exclus 🚀
    static async triggerDraw(payload: {
        locks: { client: boolean, server: boolean, database: boolean },
        currentStack: DrawnStack | null,
        blacklist: string[]
    }): Promise<DrawResponse> {
        return await this.post<DrawResponse>('/api/draw-stack', payload)
    }

    static async fetchHistory(): Promise<DrawnStack[]> {
        const data = await this.get<{ history: DrawnStack[] }>('/api/fetch-history')
        return data.history
    }

    //TODO: use inputs or dtos
    static async saveShare(payload: {
        projectType: string
        frontendId: string
        backendId: string
        databaseId: string
        ormId?: string | null
    }): Promise<{ success: boolean; shareCode: string; expiresAt: string }> {
        return await this.post<{ success: boolean; shareCode: string; expiresAt: string }>('/api/save-share', payload)
    }

    //TODO: use inputs or dtos
    static async fetchShare(code: string): Promise<{
        projectType: string
        clientLayer: Technology | null
        serverLayer: Technology | null
        databaseLayer: Technology | null
        timestamp: string
    }> {
        return await this.get<{
            projectType: string
            clientLayer: Technology | null
            serverLayer: Technology | null
            databaseLayer: Technology | null
            timestamp: string
        }>(`/api/fetch-share/${code}`)
    }

    static async fetchAllTechnologies(): Promise<Technology[]> {
        return await this.get<Technology[]>('/api/fetch-technologies')
    }

    static async fetchTechnologyBySlug(slug: string): Promise<Technology> {
        return await this.get<Technology>(`/api/fetch-technology-by-slug/${slug}`)
    }
}