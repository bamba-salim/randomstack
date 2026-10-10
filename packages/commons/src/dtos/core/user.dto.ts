import type {Role} from '../../constants'

/** Lecture user étendue (admin / profil) */
export interface PublicUserDetail {
    id: string
    email: string
    role: Role
    createdAt?: string | Date
}
