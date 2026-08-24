import type {Technology} from "./technology.interface";
import type {Post} from "./post.interface";

export interface FilterOptions {
    searchQuery: string
    selectedLanguage: string
    selectedCategory: string
    currentPage: number
    itemsPerPage: number
}

export interface FilterResult {
    paginatedItems: Technology[]
    totalPages: number
    totalItemsCount: number
}

export interface PostFilterOptions {
    searchQuery: string
    selectedStatus: string
    selectedTag: string
    currentPage: number
    itemsPerPage: number
}

export interface PostFilterResult {
    paginatedItems: Post[]
    totalPages: number
    totalItemsCount: number
}