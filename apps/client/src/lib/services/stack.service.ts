import ApiClient from './api.client'

export interface ClientTechnology {
    id: string
    name: string
    language: string
    logo?: string
    usage: string
    description: string
    category: string
}

export interface DrawnStack {
    clientLayer: ClientTechnology | null
    serverLayer: ClientTechnology | null
    databaseLayer: ClientTechnology | null
    timestamp: string
}

export interface DrawResponse {
    current: DrawnStack
    history: DrawnStack[]
}

export default class StackService extends ApiClient {
    static async triggerDraw(): Promise<DrawResponse> {
        return await this.post<DrawResponse>('/api/draw')
    }

    static async fetchHistory(): Promise<DrawnStack[]> {
        const data = await this.get<{ history: DrawnStack[] }>('/api/history')
        return data.history
    }
}