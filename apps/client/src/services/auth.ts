import ApiClient from './api.client'
import type {
    SessionUserLite,
    LoginFormBean,
    RegisterFormBean,
    EditProfileFormBean
} from '@randomstack/commons'

let currentUser: SessionUserLite | null = null
let cachedAt = 0
/** Cache court : évite l’UI « connecté » alors que la session est morte. */
const CACHE_TTL_MS = 15_000

export const login = async (credentials: LoginFormBean): Promise<SessionUserLite> => {
    const data = await ApiClient.post<{user: SessionUserLite}>('/auth/login', credentials)
    currentUser = data.user
    cachedAt = Date.now()
    return currentUser
}

export const register = async (payload: RegisterFormBean): Promise<SessionUserLite> => {
    const data = await ApiClient.post<{user: SessionUserLite}>('/auth/register', payload)
    currentUser = data.user
    cachedAt = Date.now()
    return currentUser
}

export const getMe = async (force = false): Promise<SessionUserLite | null> => {
    const fresh = !force && currentUser && Date.now() - cachedAt < CACHE_TTL_MS
    if (fresh) return currentUser
    try {
        const data = await ApiClient.get<{user: SessionUserLite}>('/auth/me')
        currentUser = data.user
        cachedAt = Date.now()
        return currentUser
    } catch {
        currentUser = null
        cachedAt = 0
        return null
    }
}

export const updateProfile = async (payload: EditProfileFormBean): Promise<SessionUserLite> => {
    const data = await ApiClient.post<{user: SessionUserLite}>('/auth/update-profile', payload)
    currentUser = data.user
    cachedAt = Date.now()
    return currentUser
}

export const logout = async (): Promise<void> => {
    try {
        await ApiClient.post('/auth/logout', {})
    } finally {
        currentUser = null
        cachedAt = 0
    }
}

export const clearAuthCache = () => {
    currentUser = null
    cachedAt = 0
}
