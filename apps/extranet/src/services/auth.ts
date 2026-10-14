import ApiClient from './api.client'
import type {SessionUserLite, LoginFormBean, Role} from '@randomstack/commons'

const STAFF_ROLES: Role[] = ['ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR']

let currentUser: SessionUserLite | null = null
let cachedAt = 0
const CACHE_TTL_MS = 15_000

const isStaff = (user: SessionUserLite | null | undefined): user is SessionUserLite =>
    Boolean(user && STAFF_ROLES.includes(user.role))

export const login = async (credentials: LoginFormBean): Promise<SessionUserLite> => {
    const data = await ApiClient.post<{user: SessionUserLite}>('/auth/admin/login', credentials)
    if (!isStaff(data.user)) {
        currentUser = null
        cachedAt = 0
        throw new Error('Identifiants incorrects.')
    }
    currentUser = data.user
    cachedAt = Date.now()
    return currentUser
}

export const getMe = async (force = false): Promise<SessionUserLite | null> => {
    const fresh = !force && currentUser && Date.now() - cachedAt < CACHE_TTL_MS
    if (fresh) {
        return isStaff(currentUser) ? currentUser : null
    }
    try {
        const data = await ApiClient.get<{user: SessionUserLite}>('/auth/admin/me')
        if (!isStaff(data.user)) {
            currentUser = null
            cachedAt = 0
            return null
        }
        currentUser = data.user
        cachedAt = Date.now()
        return currentUser
    } catch {
        currentUser = null
        cachedAt = 0
        return null
    }
}

export const logout = async (): Promise<void> => {
    try {
        await ApiClient.post('/auth/admin/logout', {})
    } finally {
        currentUser = null
        cachedAt = 0
    }
}
