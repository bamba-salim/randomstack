import type {Role} from '../../types'


export interface User {
    id: string
    email: string
    role: Role
}

export interface LoginCredentials {
    email: string
    password: string
}