import type {Role} from '../../constants'

/** Formulaire login */
export interface LoginFormBean {
    email: string
    password: string
}

/** Session /me (réduit) */
export interface SessionUserLite {
    id: string
    email: string
    role: Role
}

/** Réponse login / me */
export interface SessionUserResponse {
    user: SessionUserLite
}

/** Ack générique (logout, delete…) */
export interface SuccessAck {
    success: true
}