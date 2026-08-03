import type { Technology, FilterOptions, FilterResult } from '#interfaces'



export default class DashboardScript {
    // Moteur de filtrage cumulatif et de pagination pur 🚀
    static filterAndPaginate(techs: Technology[], options: FilterOptions): FilterResult {
        const { searchQuery, selectedLanguage, selectedCategory, currentPage, itemsPerPage } = options

        let result = techs

        // 1. Filtrage par Langage (si sélectionné)
        if (selectedLanguage) {
            result = result.filter(t => t.language.toLowerCase() === selectedLanguage.toLowerCase())
        }

        // 2. Filtrage par Catégorie (si sélectionnée)
        if (selectedCategory) {
            result = result.filter(t => t.category === selectedCategory)
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

        // Sécurisation de l'index de page courante
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

    // Extrait et trie dynamiquement les langages uniques présents en base pour le filtre 🚀
    static getUniqueLanguages(techs: Technology[]): string[] {
        const langs = techs.map(t => t.language.trim()).filter(Boolean)
        return Array.from(new Set(langs)).sort()
    }
}