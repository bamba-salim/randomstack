import type {Technology, Category} from '../../types'
import type {FilterResult, FilterOptions} from '../../interfaces'


export default class TechnologyFilter {
    static run(techs: Technology[], options: FilterOptions): FilterResult {
        const {searchQuery, selectedLanguage, selectedCategory, currentPage, itemsPerPage} = options

        let result = techs

        // 1. Filtrage cumulatif par Langage
        if (selectedLanguage) {
            result = result.filter(t => t.language.toLowerCase() === selectedLanguage.toLowerCase())
        }

        // 2. CORRECTION : Filtrage par Catégorie adapté pour le tableau categories[] 🚀
        if (selectedCategory && selectedCategory !== 'ALL') {
            result = result.filter(t => {
                const targetCategories = selectedCategory === 'FRONTEND'
                    ? ['FRONTEND', 'DESKTOP']
                    : [selectedCategory]

                // On vérifie si au moins une des catégories de l'élément correspond aux critères 🚀
                return Array.isArray(t.categories) && t.categories.some(cat => targetCategories.includes(cat))
            })
        }

        // 3. Filtrage textuel global (nom, langage, usage, description)
        if (searchQuery) {
            const q = searchQuery.toLowerCase().trim()
            result = result.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.language.toLowerCase().includes(q) ||
                t.usage.toLowerCase().includes(q) ||
                t.detail.description.toLowerCase().includes(q) ||
                t.detail.history.join(',').toLowerCase().includes(q) ||
                t.categories.join(',').toLowerCase().includes(q)
            )
        }

        // 4. Calculs de pagination
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
        const langs = techs.map(t => t.language.trim()).filter(Boolean)
        return Array.from(new Set(langs)).sort()
    }
}