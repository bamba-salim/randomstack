import ApiClient from './api.client'
import type {SessionUserLite, LoginFormBean} from '@randomstack/commons'

let currentUser: SessionUserLite | null = null

export const login = async (credentials: LoginFormBean): Promise<SessionUserLite> => {
    const data = await ApiClient.post<{user: SessionUserLite}>('/auth/admin/login', credentials)
    currentUser = data.user
    return currentUser
}

export const getMe = async (): Promise<SessionUserLite | null> => {
    if (currentUser) return currentUser
    try {
        const data = await ApiClient.get<{user: SessionUserLite}>('/auth/me')
        currentUser = data.user
        return currentUser
    } catch {
        currentUser = null
        return null
    }
}

export const logout = async (): Promise<void> => {
    await ApiClient.post('/auth/logout', {})
    currentUser = null
}
