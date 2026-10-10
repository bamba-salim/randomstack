import ApiClient from './api.client'
import type {User, LoginCredentials} from '@randomstack/commons'

let currentUser: User | null = null

export const login = async (credentials: LoginCredentials): Promise<User> => {
    const data = await ApiClient.post<{user: User}>('/auth/admin-login', credentials)
    currentUser = data.user
    return data.user
}

export const getMe = async (): Promise<User | null> => {
    if (currentUser) return currentUser
    try {
        const data = await ApiClient.get<{user: User}>('/auth/me')
        currentUser = data.user
        return data.user
    } catch {
        currentUser = null
        return null
    }
}

export const logout = async (): Promise<void> => {
    await ApiClient.post('/auth/logout')
    currentUser = null
}
