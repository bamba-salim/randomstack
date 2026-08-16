import type {Category} from "../../types";
import type {TechnoLogyVersion} from "../../interfaces";

export interface EditTechnologyFormBean {

    id?: string
    name: string
    language: string
    categories: Category[]
    usage: string
    logo?: any
    isActive?: boolean

    description?: string | null
    websiteUrl?: string | null
    docsUrl?: string | null
    creator?: string | null
    foundedAt?: string | null
    userCount?: number | null
    projectCount?: number | null
    history?: string[]
    versions?: TechnoLogyVersion | null
}