import {Category} from '@prisma/client'

import type {SaveTechnologyDTO} from "#interfaces"

export default class TechnologyMapper {
    // Convertit l'objet req.body brut en DTO typé et sécurisé pour la BDD 🚀
    static toSaveDTO(rawBody: any, logoUrl: string | null, targetId: string): SaveTechnologyDTO {
        return {
            id: targetId,
            name: String(rawBody.name || '').trim(),
            language: String(rawBody.language || '').trim(),
            usage: String(rawBody.usage || '').trim(),
            description: String(rawBody.description || '').trim(),
            category: (rawBody.category as Category) || 'FRONTEND',
            logo: logoUrl
        }
    }
}