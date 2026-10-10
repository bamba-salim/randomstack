import type {
    PublicTechnologyListed,
    AdminTechnologyListed,
    FilterResult,
    FilterOptions
} from '../..'

type FilterableTech = Pick<PublicTechnologyListed, 'name' | 'language' | 'usage' | 'categories'> & {
    descriptionPreview?: string | null
    isActive?: boolean
}

export default class TechnologyFilter {
    static run(
        techs: Array<PublicTechnologyListed | AdminTechnologyListed | FilterableTech>,
        options: FilterOptions
    ): FilterResult {
        const {searchQuery, selectedLanguage, selectedCategory, currentPage, itemsPerPage} = options

        let result = [...techs]

        if (selectedLanguage) {
            result = result.filter(t =>
                t.language?.toLowerCase() === selectedLanguage.toLowerCase()
            )
        }

        if (selectedCategory && selectedCategory !== 'ALL') {
            result = result.filter(t => {
                const targetCategories = selectedCategory === 'FRONTEND'
                    ? ['FRONTEND', 'DESKTOP']
                    : [selectedCategory]
                return Array.isArray(t.categories) && t.categories.some(cat => targetCategories.includes(cat))
            })
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase().trim()
            result = result.filter(t => {
                const name = t.name?.toLowerCase() ?? ''
                const language = t.language?.toLowerCase() ?? ''
                const usage = t.usage?.toLowerCase() ?? ''
                const description = ((t as FilterableTech).descriptionPreview ?? '').toLowerCase()
                const categories = Array.isArray(t.categories) ? t.categories.join(',').toLowerCase() : ''
                return (
                    name.includes(q) ||
                    language.includes(q) ||
                    usage.includes(q) ||
                    description.includes(q) ||
                    categories.includes(q)
                )
            })
        }

        const totalItemsCount = result.length
        const totalPages = Math.ceil(totalItemsCount / itemsPerPage) || 1
        const sanitizedPage = Math.max(1, Math.min(currentPage, totalPages))
        const start = (sanitizedPage - 1) * itemsPerPage

        return {
            paginatedItems: result.slice(start, start + itemsPerPage) as FilterResult['paginatedItems'],
            totalPages,
            totalItemsCount
        }
    }

    static getUniqueLanguages(techs: Pick<FilterableTech, 'language'>[]): string[] {
        const langs = techs.map(t => t.language?.trim()).filter(Boolean) as string[]
        return Array.from(new Set(langs)).sort((a, b) => a.localeCompare(b, 'fr'))
    }
}
