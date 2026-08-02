import fs from 'fs'
import path from 'path'

import {UserModel, TechnologyModel} from '#models'
import {PasswordUtils, FileUtils} from '#utils'

import type {RawExcelTech} from '#interfaces'
import type {Category, Role} from '@prisma/client'


export default class SeedAction {

    static async execute(): Promise<void> {
        try {
            await this.injectTechnologies()
            await this.injectAdminUser()
        } catch (error: any) {
            console.error("[Seed] ❌ ERREUR CRITIQUE rencontrée pendant le seeding :", error.message || error)
        }

    }

    private static determineCategory(utilisation: string): Category {
        const lower = utilisation.toLowerCase()

        if (lower.includes('frontend')) return 'FRONTEND'
        if (lower.includes('mobile')) return 'MOBILE'
        if (lower.includes('desktop') || lower.includes('bureau')) return 'DESKTOP'

        if (
            lower.includes('base de données') ||
            lower.includes('stockage') ||
            lower.includes('cache') ||
            lower.includes('baas') ||
            lower.includes('database')
        ) {
            return 'DATABASE'
        }

        return 'BACKEND'
    }

    private static async injectTechnologies() {


        const techCount = await TechnologyModel.count()
        if (techCount === 0) {
            // Lecture simplifiée et sécurisée via FileUtils ! 🚀
            let technologies = FileUtils.readJSON<RawExcelTech[]>('technologies.json')
            if (!technologies) {
                technologies = FileUtils.readJSON<RawExcelTech[]>('techno.json')
            }

            if (!technologies) {
                console.warn("[Seed] Aucun fichier de technologies valide trouvé pour l'alimentation.")
                return
            }

            for (const tech of technologies) {
                const category = this.determineCategory(tech.Utilisation)
                await TechnologyModel.insertTechnology(tech, category)
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