import type {AdminPostListed, PostFilterOptions, PostFilterResult} from '@randomstack/commons'

export default class PostFilter {
    static run(posts: AdminPostListed[], options: PostFilterOptions): PostFilterResult {
        const {searchQuery, selectedStatus, selectedTag, currentPage, itemsPerPage} = options

        let result = posts

        if (selectedStatus && selectedStatus !== 'ALL') {
            result = result.filter(p => p.status === selectedStatus)
        }

        if (selectedTag && selectedTag !== 'ALL') {
            result = result.filter(p => Array.isArray(p.tags) && p.tags.includes(selectedTag))
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase().trim()
            result = result.filter(p => {
                const titleMatch = p.title.toLowerCase().includes(q)
                const tagsMatch = Array.isArray(p.tags) && p.tags.some(tag => tag.toLowerCase().includes(q))
                return titleMatch || tagsMatch
            })
        }

        const totalItemsCount = result.length
        const totalPages = Math.ceil(totalItemsCount / itemsPerPage) || 1

        const sanitizedPage = Math.max(1, Math.min(currentPage, totalPages))
        const start = (sanitizedPage - 1) * itemsPerPage
        const end = start + itemsPerPage
        const paginatedItems = result.slice(start, end)

        return {
            paginatedItems,
            totalPages,
            totalItemsCount
        }
    }

    static getUniqueTags(posts: AdminPostListed[]): string[] {
        const tags = posts.flatMap(p => p.tags || [])
        return Array.from(new Set(tags)).sort()
    }
}
