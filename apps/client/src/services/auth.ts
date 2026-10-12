import ApiClient from './api.client'
import type {
    SessionUserLite,
    LoginFormBean,
    RegisterFormBean,
    EditProfileFormBean
} from '@randomstack/commons'

let currentUser: SessionUserLite | null = null

export const login = async (credentials: LoginFormBean): Promise<SessionUserLite> => {
    const data = await ApiClient.post<{user: SessionUserLite}>('/auth/login', credentials)
    currentUser = data.user
    return currentUser
}

export const register = async (payload: RegisterFormBean): Promise<SessionUserLite> => {
    const data = await ApiClient.post<{user: SessionUserLite}>('/auth/register', payload)
    currentUser = data.user
    return currentUser
}

export const getMe = async (force = false): Promise<SessionUserLite | null> => {
    if (currentUser && !force) return currentUser
    try {
        const data = await ApiClient.get<{user: SessionUserLite}>('/auth/me')
        currentUser = data.user
        return currentUser
    } catch {
        currentUser = null
        return null
    }
}

export const updateProfile = async (payload: EditProfileFormBean): Promise<SessionUserLite> => {
    const data = await ApiClient.post<{user: SessionUserLite}>('/auth/update-profile', payload)
    currentUser = data.user
    return currentUser
}

export const logout = async (): Promise<void> => {
    try {
        await ApiClient.post('/auth/logout', {})
    } finally {
        currentUser = null
    }
}

export const clearAuthCache = () => {
    currentUser = null
}
