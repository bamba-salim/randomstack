import type {Technology} from '../../interfaces'
import type {FilterResult, FilterOptions} from '../../interfaces'

export default class TechnologyFilter {
    static run(techs: Technology[], options: FilterOptions): FilterResult {
        const {searchQuery, selectedLanguage, selectedCategory, currentPage, itemsPerPage} = options

        let result = techs

        // 1. Filtrage par langage
        if (selectedLanguage) {
            result = result.filter(t =>
                t.language?.toLowerCase() === selectedLanguage.toLowerCase()
            )
        }

        // 2. Filtrage par catégorie (tableau categories[])
        if (selectedCategory && selectedCategory !== 'ALL') {
            result = result.filter(t => {
                const targetCategories = selectedCategory === 'FRONTEND'
                    ? ['FRONTEND', 'DESKTOP']
                    : [selectedCategory]

                return Array.isArray(t.categories) && t.categories.some(cat => targetCategories.includes(cat))
            })
        }

        // 3. Recherche textuelle (detail optionnel / nullable)
        if (searchQuery) {
            const q = searchQuery.toLowerCase().trim()
            result = result.filter(t => {
                const name = t.name?.toLowerCase() ?? ''
                const language = t.language?.toLowerCase() ?? ''
                const usage = t.usage?.toLowerCase() ?? ''
                const description = t.detail?.description?.toLowerCase() ?? ''
                const history = Array.isArray(t.detail?.history)
                    ? t.detail.history.join(',').toLowerCase()
                    : ''
                const categories = Array.isArray(t.categories)
                    ? t.categories.join(',').toLowerCase()
                    : ''

                return (
                    name.includes(q) ||
                    language.includes(q) ||
                    usage.includes(q) ||
                    description.includes(q) ||
                    history.includes(q) ||
                    categories.includes(q)
                )
            })
        }

        // 4. Pagination
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

    static getUniqueLanguages(techs: Technology[]): string[] {
        const langs = techs.map(t => t.language?.trim()).filter(Boolean) as string[]
        return Array.from(new Set(langs)).sort((a, b) => a.localeCompare(b, 'fr'))
    }
}
