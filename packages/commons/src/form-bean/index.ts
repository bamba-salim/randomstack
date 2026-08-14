import type {Category} from '../types'

export interface LoginFormBean {
    email: string
    password: string
}

export interface EditTechnologyFormBean {
    id?: string
    name: string
    language: string
    categories: Category[]
    usage: string
    logo?: any

    description?: string | null
    websiteUrl?: string | null
    docsUrl?: string | null
    creator?: string | null
    foundedAt?: string | null
    userCount?: number | null
    projectCount?: number | null
    history?: string[]
}