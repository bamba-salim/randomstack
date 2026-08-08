import type {Technology} from "./technology.interface";

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