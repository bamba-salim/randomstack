import ApiClient from '../api.client'

import type {User, LoginCredentials} from '@randomstack/commons'


export default class AuthService extends ApiClient {
    static currentUser: User | null = null

    static async login(credentials: LoginCredentials): Promise<User> {
        // Appelle la route d'auth admin spécifique que nous avons codée 🚀
        const data = await this.post<{ user: User }>('/api/auth/admin/login', credentials)
        this.currentUser = data.user
        return data.user
    }

    static async getMe(): Promise<User | null> {
        if (this.currentUser) return this.currentUser
        try {
            const data = await this.get<{ user: User }>('/api/auth/me')
            this.currentUser = data.user
            return data.user
        } catch {
            this.currentUser = null
            return null
        }
    }

    static async logout(): Promise<void> {
        await this.post('/api/auth/logout')
        this.currentUser = null
    }

}