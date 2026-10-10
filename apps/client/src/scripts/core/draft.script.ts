import type {DrawTechnologyLite} from '#services'

export default class DraftScript {
    static readonly PLACEHOLDERS: DrawTechnologyLite[] = [
        {id: 'p1', name: 'Angular', slug: 'angular', language: 'TypeScript', logo: null, categories: ['FRONTEND']},
        {id: 'p2', name: 'Django', slug: 'django', language: 'Python', logo: null, categories: ['BACKEND']},
        {id: 'p3', name: 'MySQL', slug: 'mysql', language: 'SQL', logo: null, categories: ['DATABASE']},
        {id: 'p4', name: 'React', slug: 'react', language: 'JS', logo: null, categories: ['FRONTEND']},
        {id: 'p5', name: 'FastAPI', slug: 'fastapi', language: 'Python', logo: null, categories: ['BACKEND']},
        {id: 'p6', name: 'MongoDB', slug: 'mongodb', language: 'NoSQL', logo: null, categories: ['DATABASE']},
        {id: 'p7', name: 'Svelte', slug: 'svelte', language: 'JS', logo: null, categories: ['FRONTEND']},
        {id: 'p8', name: 'Spring Boot', slug: 'spring-boot', language: 'Java', logo: null, categories: ['BACKEND']},
        {id: 'p9', name: 'Redis', slug: 'redis', language: 'NoSQL', logo: null, categories: ['DATABASE']}
    ]

    static generateReelStrip(finalItem: DrawTechnologyLite | null, category: string): DrawTechnologyLite[] {
        const filtered = this.PLACEHOLDERS.filter(p => {
            if (category === 'CLIENT') {
                return p.categories.some(c => ['FRONTEND', 'MOBILE', 'DESKTOP'].includes(c))
            }
            if (category === 'SERVER') return p.categories.includes('BACKEND')
            if (category === 'DATABASE') return p.categories.includes('DATABASE')
            return p.categories.includes(category as DrawTechnologyLite['categories'][number])
        })

        const strip: DrawTechnologyLite[] = []
        for (let i = 0; i < 9; i++) {
            const item = filtered[i % filtered.length]
            if (item) strip.push(item)
        }

        strip.push(finalItem || {
            id: 'empty',
            name: '...',
            slug: 'empty',
            language: '',
            logo: null,
            categories: []
        })
        return strip
    }
}
