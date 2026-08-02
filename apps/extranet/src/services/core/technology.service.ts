import ApiClient from '../api.client.js'
import type { Technology } from '#interfaces'

export default class TechnologyService extends ApiClient {
    static async fetchAll(): Promise<Technology[]> {
        return await this.get<Technology[]>('/api/technologies')
    }
}