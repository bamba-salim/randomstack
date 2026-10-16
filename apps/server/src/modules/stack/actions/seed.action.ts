import {UserModel} from '#user'
import {PasswordUtils} from '#utils'
import {FileUtils} from '#file'

import TechnologyModel from '../models/technology.model'
import TechnologyMapper from '../mappers/technology.mapper'

import type {Category, RawExcelTech, Role} from '@randomstack/commons'

type SeedAccount = {
    envEmail: string
    envPassword: string
    fallbackEmail: string
    fallbackPassword: string
    role: Role
    displayName: string
}

const SEED_ACCOUNTS: SeedAccount[] = [
    {
        envEmail: 'ADMIN_EMAIL',
        envPassword: 'ADMIN_PASSWORD',
        fallbackEmail: 'admin@randomstack.com',
        fallbackPassword: 'adminpassword',
        role: 'ADMIN',
        displayName: 'Admin'
    },
    {
        envEmail: 'MODERATOR_EMAIL',
        envPassword: 'MODERATOR_PASSWORD',
        fallbackEmail: 'moderateur@randomstack.com',
        fallbackPassword: 'moderateurpassword',
        role: 'MODERATOR',
        displayName: 'Modérateur'
    },
    {
        envEmail: 'EDITOR_EMAIL',
        envPassword: 'EDITOR_PASSWORD',
        fallbackEmail: 'editeur@randomstack.com',
        fallbackPassword: 'editeurpassword',
        role: 'EDITOR',
        displayName: 'Éditeur'
    },
    {
        envEmail: 'AUTHOR_EMAIL',
        envPassword: 'AUTHOR_PASSWORD',
        fallbackEmail: 'auteur@randomstack.com',
        fallbackPassword: 'auteurpassword',
        role: 'AUTHOR',
        displayName: 'Auteur'
    },
    {
        envEmail: 'USER_EMAIL',
        envPassword: 'USER_PASSWORD',
        fallbackEmail: 'user@randomstack.com',
        fallbackPassword: 'userpassword',
        role: 'USER',
        displayName: 'User'
    }
]

export default class SeedAction {

    static async execute(): Promise<void> {
        try {
            await this.injectTechnologies()
            await this.injectSeedUsers()
        } catch (error: any) {
            console.error('[Seed] ❌ ERREUR CRITIQUE rencontrée pendant le seeding :', error.message || error)
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
            lower.includes('database')
        ) {
            categories.push('DATABASE')
        }

        if (
            lower.includes('backend')
            || lower.includes('back-end')
            || lower.includes('serveur')
            || lower.includes('api')
            || lower.includes('runtime')
        ) {
            categories.push('BACKEND')
        }

        // Encyclopédie (hors tirage si aucune couche FRONT/BACK/DB/…)
        if (
            lower.includes('saas')
            || lower.includes('api tierce')
            || lower.includes('api externe')
            || lower.includes('third-party')
        ) {
            categories.push('API')
        }
        if (lower.includes('cms') || lower.includes('wordpress') || lower.includes('headless')) {
            categories.push('CMS')
        }
        if (
            lower.includes('agent ia')
            || lower.includes('ai agent')
            || lower.includes('llm')
            || lower.includes('copilot')
        ) {
            categories.push('AI_AGENT')
        }
        if (
            lower.includes('librairie')
            || lower.includes('library')
            || lower.includes('css')
            || lower.includes('jquery')
            || lower.includes('tailwind')
            || lower.includes('bootstrap')
        ) {
            categories.push('LIBRARY')
        }
        if (lower.includes('orm') || lower.includes('odm') || lower.includes('query builder')) {
            categories.push('ORM')
        }
        if (lower.includes('baas') || lower.includes('firebase') || lower.includes('supabase')) {
            categories.push('BAAS')
        }

        if (categories.length === 0) {
            console.warn(
                `[Seed] Catégorie non reconnue pour utilisation="${utilisation}" → fallback BACKEND`
            )
            categories.push('BACKEND')
        }

        return categories
    }

    private static async injectTechnologies() {
        const techCount = await TechnologyModel.countTechnologies()
        if (techCount === 0) {
            let technologies = FileUtils.readJSON<RawExcelTech[]>('technologies.json')

            if (!technologies) {
                technologies = FileUtils.readJSON<RawExcelTech[]>('techno.json')
            }

            if (!technologies) {
                console.warn('[Seed] Aucun fichier de technologies valide trouvé pour l\'alimentation.')
                return
            }

            for (const tech of technologies) {
                const categories = this.determineCategories(tech.Utilisation)
                const targetId = crypto.randomUUID()
                const techno = TechnologyMapper.toSaveFromExcel(tech, categories, targetId)

                await TechnologyModel.createTechnology(techno)
            }
            console.log(`[Seed] ✅ Ingestion réussie : ${technologies.length} technologies importées de l'Excel.`)
        }
    }

    private static async injectSeedUsers() {
        for (const account of SEED_ACCOUNTS) {
            await this.ensureSeedUser(account)
        }
    }

    private static async ensureSeedUser(account: SeedAccount): Promise<void> {
        const email = process.env[account.envEmail] || account.fallbackEmail
        const password = process.env[account.envPassword] || account.fallbackPassword
        const passwordHash = PasswordUtils.hash(password)

        const existing = await UserModel.findByEmail(email)
        if (!existing) {
            await UserModel.createWithProfile(email, passwordHash, account.role, account.displayName)
            console.log(`[Seed] 👤 Compte ${account.role} créé : ${email}`)
            return
        }

        await UserModel.updateSeedAccount(existing.id, {
            role: account.role,
            passwordHash,
            displayName: account.displayName
        })
        // console.log(`[Seed] 👤 Compte ${account.role} synchronisé : ${email}`)
    }
}
