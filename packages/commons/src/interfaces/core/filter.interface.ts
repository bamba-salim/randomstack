import type {
    PublicTechnologyListed,
    AdminTechnologyListed,
    AdminPostListed
} from '../../dtos'

export interface FilterOptions {
    searchQuery: string
    selectedLanguage: string
    selectedCategory: string
    currentPage: number
    itemsPerPage: number
}

export interface FilterResult {
    paginatedItems: Array<PublicTechnologyListed | AdminTechnologyListed>
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
    paginatedItems: AdminPostListed[]
    totalPages: number
    totalItemsCount: number
}
