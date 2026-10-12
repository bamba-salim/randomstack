import type {Role} from '../../constants'

/** Formulaire login */
export interface LoginFormBean {
    email: string
    password: string
}

/** Formulaire inscription publique */
export interface RegisterFormBean {
    email: string
    password: string
    displayName?: string
}

/** Lien portfolio (session / profil) */
export interface ProfileLinkListed {
    id: string
    label: string
    url: string
    sortOrder: number
}

/** Session /me (+ profil public léger) */
export interface SessionUserLite {
    id: string
    email: string
    role: Role
    displayName: string | null
    bio: string | null
    photoId: string | null
    links: ProfileLinkListed[]
}

/** Formulaire édition profil (client connecté) */
export interface EditProfileFormBean {
    displayName: string
    bio?: string | null
    photoId?: string | null
    links: Array<{
        label: string
        url: string
        sortOrder?: number
    }>
}

/** Réponse login / me / update-profile */
export interface SessionUserResponse {
    user: SessionUserLite
}

/** Ack générique (logout, delete…) */
export interface SuccessAck {
    success: true
}