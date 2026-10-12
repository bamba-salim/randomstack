import ApiClient from './api.client'
import type {SessionUserLite, LoginFormBean, Role} from '@randomstack/commons'

const STAFF_ROLES: Role[] = ['ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR']

let currentUser: SessionUserLite | null = null

const isStaff = (user: SessionUserLite | null | undefined): user is SessionUserLite =>
    Boolean(user && STAFF_ROLES.includes(user.role))

export const login = async (credentials: LoginFormBean): Promise<SessionUserLite> => {
    const data = await ApiClient.post<{user: SessionUserLite}>('/auth/admin/login', credentials)
    if (!isStaff(data.user)) {
        currentUser = null
        throw new Error("Ce compte n'existe pas.")
    }
    currentUser = data.user
    return currentUser
}

export const getMe = async (): Promise<SessionUserLite | null> => {
    if (currentUser) {
        return isStaff(currentUser) ? currentUser : null
    }
    try {
        const data = await ApiClient.get<{user: SessionUserLite}>('/auth/admin/me')
        if (!isStaff(data.user)) {
            currentUser = null
            return null
        }
        currentUser = data.user
        return currentUser
    } catch {
        currentUser = null
        return null
    }
}

export const logout = async (): Promise<void> => {
    try {
        await ApiClient.post('/auth/admin/logout', {})
    } finally {
        currentUser = null
    }
}
