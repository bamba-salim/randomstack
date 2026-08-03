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
    // Envoi des verrous et de la blacklist sous forme d'IDs exclus 🚀
    static async triggerDraw(payload: {
        locks: { client: boolean, server: boolean, database: boolean },
        currentStack: DrawnStack | null,
        blacklist: string[]
    }): Promise<DrawResponse> {
        return await this.post<DrawResponse>('/api/draw-stack', payload)
    }

    static async fetchAllTechnologies(): Promise<ClientTechnology[]> {
        return await this.get<ClientTechnology[]>('/api/fetch-technologies')
    }
}