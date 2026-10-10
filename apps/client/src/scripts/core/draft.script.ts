import type {ClientTechnology} from '#services'

export default class DraftScript {
    // Placeholders d'attente pour la rotation des rouleaux
    static readonly PLACEHOLDERS: ClientTechnology[] = [
        {id: 'p1', name: 'Angular', slug: 'angular', language: 'TypeScript', logo: null, usage: 'Frontend', categories: ['FRONTEND'], isActive: true},
        {id: 'p2', name: 'Django', slug: 'django', language: 'Python', logo: null, usage: 'Backend', categories: ['BACKEND'], isActive: true},
        {id: 'p3', name: 'MySQL', slug: 'mysql', language: 'SQL', logo: null, usage: 'Database', categories: ['DATABASE'], isActive: true},
        {id: 'p4', name: 'React', slug: 'react', language: 'JS', logo: null, usage: 'Frontend', categories: ['FRONTEND'], isActive: true},
        {id: 'p5', name: 'FastAPI', slug: 'fastapi', language: 'Python', logo: null, usage: 'Backend', categories: ['BACKEND'], isActive: true},
        {id: 'p6', name: 'MongoDB', slug: 'mongodb', language: 'NoSQL', logo: null, usage: 'Database', categories: ['DATABASE'], isActive: true},
        {id: 'p7', name: 'Svelte', slug: 'svelte', language: 'JS', logo: null, usage: 'Frontend', categories: ['FRONTEND'], isActive: true},
        {id: 'p8', name: 'Spring Boot', slug: 'spring-boot', language: 'Java', logo: null, usage: 'Backend', categories: ['BACKEND'], isActive: true},
        {id: 'p9', name: 'Redis', slug: 'redis', language: 'NoSQL', logo: null, usage: 'Database', categories: ['DATABASE'], isActive: true}
    ]

    static generateReelStrip(finalItem: ClientTechnology | null, category: string): ClientTechnology[] {
        const filtered = this.PLACEHOLDERS.filter(p => {
            if (category === 'CLIENT') {
                return p.categories.some(c => ['FRONTEND', 'MOBILE', 'DESKTOP'].includes(c))
            }
            if (category === 'SERVER') return p.categories.includes('BACKEND')
            if (category === 'DATABASE') return p.categories.includes('DATABASE')
            return p.categories.includes(category as ClientTechnology['categories'][number])
        })

        const strip: ClientTechnology[] = []
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
            usage: '',
            categories: [],
            isActive: false
        })
        return strip
    }
}
