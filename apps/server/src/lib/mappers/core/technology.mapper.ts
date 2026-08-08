import type {Category, SaveTechnologyInput} from '@randomstack/commons'

export default class TechnologyMapper {
    // Convertit l'objet req.body brut en DTO typé et sécurisé pour la BDD 🚀
    static toSaveDTO(rawBody: any, logoUrl: string | null, targetId: string): SaveTechnologyInput {

        let categoriesList: Category[] = ['FRONTEND']
        if (Array.isArray(rawBody.categories)) {
            categoriesList = rawBody.categories as Category[]
        } else if (rawBody.categories) {
            categoriesList = [rawBody.categories as Category]
        }

        return {
            id: targetId,
            name: String(rawBody.name || '').trim(),
            language: String(rawBody.language || '').trim(),
            usage: String(rawBody.usage || '').trim(),
            description: String(rawBody.description || '').trim(),
            category: categoriesList,
            logo: logoUrl
        }
    }
}