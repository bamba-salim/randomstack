import type {Role} from '../../constants'
import type {AdminPostListed} from './blog.dto'

/** Lecture user étendue (admin / profil) */
export interface PublicUserDetail {
    id: string
    email: string
    role: Role
    createdAt?: string | Date
}

/** Option select auteur (extranet ADMIN) */
export interface EditorialAuthorLite {
    id: string
    displayName: string
    email: string
}

/** Lien portfolio (lecture admin) */
export interface AdminUserLinkListed {
    id: string
    label: string
    url: string
    sortOrder: number
}

/** Ligne table utilisateurs extranet */
export interface AdminUserListed {
    id: string
    email: string
    role: Role
    displayName: string
    photoId: string | null
    createdAt: string | Date
    postsCount: number
    linksCount: number
}

/** Fiche utilisateur extranet (lecture + rôle modifiable) */
export interface AdminUserDetail {
    id: string
    email: string
    role: Role
    displayName: string
    bio: string | null
    photoId: string | null
    createdAt: string | Date
    updatedAt: string | Date
    links: AdminUserLinkListed[]
    posts: AdminPostListed[]
}

/** Changement de rôle uniquement */
export interface UpdateUserRoleFormBean {
    role: Role
}

export interface UpdateUserRoleResponse {
    success: true
    user: AdminUserListed
}

/** Création compte (ADMIN only) */
export interface CreateUserFormBean {
    email: string
    password: string
    displayName: string
    role: Role
}

export interface CreateUserResponse {
    success: true
    user: AdminUserListed
}
