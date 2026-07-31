import { type ClientTechnology } from '#services'

export default class HomeScript {
    // Vos constantes statiques de placeholders 🚀
    static readonly PLACEHOLDERS: ClientTechnology[] = [
        { id: 'p1', name: 'Angular', language: 'TypeScript', usage: 'Frontend', description: '', category: 'FRONTEND' },
        { id: 'p2', name: 'Django', language: 'Python', usage: 'Backend', description: '', category: 'BACKEND' },
        { id: 'p3', name: 'MySQL', language: 'SQL', usage: 'Database', description: '', category: 'DATABASE' },
        { id: 'p4', name: 'React', language: 'JS', usage: 'Frontend', description: '', category: 'FRONTEND' },
        { id: 'p5', name: 'FastAPI', language: 'Python', usage: 'Backend', description: '', category: 'BACKEND' },
        { id: 'p6', name: 'MongoDB', language: 'NoSQL', usage: 'Database', description: '', category: 'DATABASE' },
        { id: 'p7', name: 'Svelte', language: 'JS', usage: 'Frontend', description: '', category: 'FRONTEND' },
        { id: 'p8', name: 'Spring Boot', language: 'Java', usage: 'Backend', description: '', category: 'BACKEND' },
        { id: 'p9', name: 'Redis', language: 'NoSQL', usage: 'Database', description: '', category: 'DATABASE' }
    ]

    // Fonction pure d'utilité pour générer la bande de défilement (découplée de tout état Vue) 🚀
    static generateReelStrip(finalItem: ClientTechnology | null, category: string): ClientTechnology[] {
        const filtered = this.PLACEHOLDERS.filter(p => {
            if (category === 'CLIENT') return ['FRONTEND', 'MOBILE', 'DESKTOP'].includes(p.category)
            return p.category === category
        })

        const strip: ClientTechnology[] = []
        for (let i = 0; i < 9; i++) {
            const item = filtered[i % filtered.length]
            if (item) strip.push(item)
        }

        // Le 10ème élément est notre résultat final
        strip.push(finalItem || { id: 'empty', name: '...', language: '', usage: '', description: '', category: '' })
        return strip
    }
}