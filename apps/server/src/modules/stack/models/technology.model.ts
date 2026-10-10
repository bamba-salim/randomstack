import { BaseModel } from '#abstracts'
import type { EditTechnology } from '@randomstack/commons'

export default class TechnologyModel extends BaseModel {

    // =========================================================================
    // 🌐 1. REQUÊTES CLIENT (ENCYCLOPÉDIE & GÉNÉRATEUR)
    // =========================================================================

    /**
     * Récupère toutes les technologies avec leurs détails pour l'encyclopédie
     */
    static async fetchTechnologies() {
        return await this.db.technology.findMany({
            include: { detail: true },
            orderBy: { name: 'asc' }
        })
    }

    /**
     * Récupère uniquement les technologies actives pour le tirage de la machine à sous
     */
    static async fetchActiveTechnologies() {
        return await this.db.technology.findMany({
            where: { isActive: true },
            include: { detail: true },
            orderBy: { name: 'asc' }
        })
    }

    /**
     * Fiche détaillée d'une technologie via son permalien (slug)
     */
    static async fetchTechnologyBySlug(slug: string) {
        return await this.db.technology.findUnique({
            where: { slug },
            include: { detail: true }
        })
    }

    // =========================================================================
    // 🛠️ 2. REQUÊTES ADMIN (EXTRANET / ÉDITION)
    // =========================================================================

    static async fetchTechnologyById(id: string) {
        return await this.db.technology.findUnique({
            where: { id },
            include: { detail: true }
        })
    }

    static async createTechnology(payload: EditTechnology) {
        const { id: _, ...detailWithoutId } = payload.detail

        return await this.db.technology.create({
            data: {
                ...payload.technology,
                detail: {
                    create: detailWithoutId
                }
            },
            include: { detail: true }
        })
    }

    static async updateTechnology(id: string, payload: EditTechnology) {
        const { id: _, slug: __, ...technologyData } = payload.technology

        return await this.db.technology.update({
            where: { id },
            data: {
                ...technologyData,
                detail: {
                    update: payload.detail
                }
            },
            include: { detail: true }
        })
    }

    static async countTechnologies(): Promise<number> {
        return await this.db.technology.count()
    }
}