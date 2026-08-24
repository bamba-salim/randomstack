import type {Post, PostFilterOptions, PostFilterResult} from '@randomstack/commons'

export default class PostFilter {
    static run(posts: Post[], options: PostFilterOptions): PostFilterResult {
        const {searchQuery, selectedStatus, selectedTag, currentPage, itemsPerPage} = options

        let result = posts

        // 1. Filtrage cumulatif par Statut de publication
        if (selectedStatus && selectedStatus !== 'ALL') {
            result = result.filter(p => p.status === selectedStatus)
        }

        // 2. Filtrage cumulatif par Tag
        if (selectedTag && selectedTag !== 'ALL') {
            result = result.filter(p => Array.isArray(p.tags) && p.tags.includes(selectedTag))
        }

        // 3. Filtrage textuel croisé (Titre, Auteur, et recherche dans les blocs JSON de contenu) 🚀
        if (searchQuery) {
            const q = searchQuery.toLowerCase().trim()
            result = result.filter(p => {
                const titleMatch = p.title.toLowerCase().includes(q)

                // Recherche si l'ID d'auteur contient la recherche (Prêt pour les futurs noms d'auteurs)
                const authorMatch = p.authorIds.some(id => id.toLowerCase().includes(q))

                // Recherche récursive profonde à l'intérieur de la structure JSON de vos blocs ! 🚀
                const contentMatch = Array.isArray(p.content) && p.content.some(block => {
                    if (block.type === 'DOUBLE_CONTENT') {
                        return (
                            (block.left?.value && block.left.value.toLowerCase().includes(q)) ||
                            (block.right?.value && block.right.value.toLowerCase().includes(q))
                        )
                    }
                    return block.value && block.value.toLowerCase().includes(q)
                })

                return titleMatch || authorMatch || contentMatch
            })
        }

        // 4. Calculs de pagination sémantique
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

    // Extrait dynamiquement tous les tags existants en BDD pour alimenter le sélecteur d'admin 🚀
    static getUniqueTags(posts: Post[]): string[] {
        const tags = posts.flatMap(p => p.tags || [])
        return Array.from(new Set(tags)).sort()
    }
}