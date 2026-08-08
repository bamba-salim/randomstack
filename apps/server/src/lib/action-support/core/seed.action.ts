import {UserModel, TechnologyModel} from '#models'
import {PasswordUtils, FileUtils} from '#utils'

import type {Category, RawExcelTech} from '@randomstack/commons'


export default class SeedAction {

    static async execute(): Promise<void> {
        try {
            await this.injectTechnologies()
            await this.injectAdminUser()
        } catch (error: any) {
            console.error("[Seed] ❌ ERREUR CRITIQUE rencontrée pendant le seeding :", error.message || error)
        }

    }

    private static determineCategories(utilisation: string): Category[] {
        const lower = utilisation.toLowerCase()
        const categories: Category[] = []

        if (lower.includes('frontend')) categories.push('FRONTEND')
        if (lower.includes('mobile')) categories.push('MOBILE')
        if (lower.includes('desktop') || lower.includes('bureau')) categories.push('DESKTOP')

        if (
            lower.includes('base de données') ||
            lower.includes('stockage') ||
            lower.includes('cache') ||
            lower.includes('baas') ||
            lower.includes('database')
        ) {
            categories.push('DATABASE')
        }

        if (categories.length === 0) {
            categories.push('BACKEND')
        }

        return categories
    }

    private static async injectTechnologies() {
        const techCount = await TechnologyModel.count()
        if (techCount === 0) {

            let technologies = FileUtils.readJSON<RawExcelTech[]>('technologies.json')

            if (!technologies) {
                technologies = FileUtils.readJSON<RawExcelTech[]>('techno.json')
            }

            if (!technologies) {
                console.warn("[Seed] Aucun fichier de technologies valide trouvé pour l'alimentation.")
                return
            }

            for (const tech of technologies) {
                const categories = this.determineCategories(tech.Utilisation)
                await TechnologyModel.insertTechnology(tech, categories)
            }
            console.log(`[Seed] ✅ Ingestion réussie : ${technologies.length} technologies importées de l'Excel.`)

        }
    }

    private static async injectAdminUser() {

        // INGESTION DU COMPTE ADMINISTRATEUR PAR DÉFAUT 🚀
        const userCount = await UserModel.count()
        if (userCount === 0) {

            const defaultEmail = 'admin@randomstack.com'
            const passwordHash = PasswordUtils.hash('adminpassword')

            await UserModel.createAdmin(defaultEmail, passwordHash)

            console.log(`[Seed] 👤 Compte Administrateur généré par défaut : ${defaultEmail} / adminpassword`)
        }
    }
}