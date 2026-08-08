import type {Technology, FilterOptions, FilterResult} from '../../interfaces'


export default class TechnologyFilter {
    // Moteur de tri et de pagination universel (partagé entre client public et admin) 🚀
    static run(techs: Technology[], options: FilterOptions): FilterResult {
        const {searchQuery, selectedLanguage, selectedCategory, currentPage, itemsPerPage} = options

        let result = techs

        // 1. Filtrage cumulatif par Langage (exact match)
        if (selectedLanguage) {
            result = result.filter(t => t.language.toLowerCase() === selectedLanguage.toLowerCase())
        }

        // 2. Filtrage par Catégorie (exact match)
        if (selectedCategory && selectedCategory !== 'ALL') {
            result = result.filter(t => {
                // Pour l'encyclopédie, on regroupe desktop sous le web
                if (selectedCategory === 'FRONTEND') return ['FRONTEND', 'DESKTOP'].includes(t.category)
                return t.category === selectedCategory
            })
        }

        // 3. Filtrage textuel global (nom, langage, usage, description)
        if (searchQuery) {
            const q = searchQuery.toLowerCase().trim()
            result = result.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.language.toLowerCase().includes(q) ||
                t.usage.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q)
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

    // Extraction dynamique de tous les langages uniques présents dans la liste 🚀
    static getUniqueLanguages(techs: Technology[]): string[] {
        const langs = techs.map(t => t.language.trim()).filter(Boolean)
        return Array.from(new Set(langs)).sort()
    }
}