import crypto from 'crypto'
import {UserModel} from '#user'
import {PasswordUtils} from '#utils'
import {FileUtils} from '#file'

import TechnologyModel from '../models/technology.model'
import TechnologyCompatibilityModel from '../models/technology-compatibility.model'
import TechnologyMapper from '../mappers/technology.mapper'

import type {Category, CompatibilityKind, RawExcelTech, Role} from '@randomstack/commons'

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
            await this.syncBaasCategories()
            await this.injectFirebaseCompatibilities()
            await this.injectSeedUsers()
        } catch (error: any) {
            console.error('[Seed] ❌ ERREUR CRITIQUE rencontrée pendant le seeding :', error.message || error)
        }
    }

    private static determineCategories(utilisation: string, framework = ''): Category[] {
        const lower = `${utilisation} ${framework}`.toLowerCase()
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

        const isBaas =
            lower.includes('baas')
            || lower.includes('backend-as-a-service')
            || lower.includes('backend as a service')
            || lower.includes('firebase')
            || lower.includes('supabase')

        // BaaS avant le match générique « backend » (ex. « Backend-as-a-Service »)
        if (isBaas) {
            categories.push('BAAS')
        } else if (
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

        if (categories.length === 0) {
            console.warn(
                `[Seed] Catégorie non reconnue pour utilisation="${utilisation}" → fallback BACKEND`
            )
            categories.push('BACKEND')
        }

        return categories
    }

    /** Reclasse Firebase / Supabase en BAAS (idempotent, DBs déjà seedées). */
    private static async syncBaasCategories() {
        const baasNames = new Set(['firebase', 'supabase'])
        const all = await TechnologyModel.fetchTechnologies()
        let updated = 0

        for (const tech of all) {
            if (!baasNames.has(tech.name.toLowerCase())) continue
            const cats = tech.categories as Category[]
            if (cats.length === 1 && cats[0] === 'BAAS') continue
            await TechnologyModel.setCategories(tech.id, ['BAAS'])
            updated++
        }

        if (updated) {
            console.log(`[Seed] ✅ Catégorie BAAS synchronisée : ${updated} techno(s).`)
        }
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
                const categories = this.determineCategories(tech.Utilisation, tech.Framework)
                const targetId = crypto.randomUUID()
                const techno = TechnologyMapper.toSaveFromExcel(tech, categories, targetId)

                await TechnologyModel.createTechnology(techno)
            }
            console.log(`[Seed] ✅ Ingestion réussie : ${technologies.length} technologies importées de l'Excel.`)
        }
    }

    /**
     * Compatibilités Firebase (BaaS) → technos d’autres catégories uniquement.
     * Idempotent : réécrit les liens Firebase à chaque boot.
     */
    private static async injectFirebaseCompatibilities() {
        const all = await TechnologyModel.fetchTechnologies()
        const byName = new Map(all.map(t => [t.name.toLowerCase(), t]))

        const firebase = byName.get('firebase')
        if (!firebase) {
            console.warn('[Seed] Firebase introuvable — compatibilités ignorées.')
            return
        }

        // Uniquement d’autres catégories que BAAS (FRONTEND / MOBILE / BACKEND / …)
        const recommended = [
            'React',
            'Flutter',
            'Angular',
            'Vue.js',
            'Next.js',
            'React Native',
            'Nuxt.js',
            'SvelteKit'
        ]
        const worksWith = [
            'Svelte',
            'SolidJS',
            'Astro',
            'Preact',
            'Gatsby',
            'Remix',
            'Alpine.js',
            'Vanilla JS',
            'Vanilla TS',
            'SwiftUI',
            'Jetpack Compose',
            'UIKit',
            'Kotlin Multiplatform (KMP)',
            '.NET MAUI / Xamarin',
            'Node.js',
            'Express.js',
            'NestJS',
            'Fastify',
            'Koa.js',
            'Hapi.js',
            'Django',
            'Flask',
            'FastAPI',
            'Laravel',
            'Spring Boot',
            'ASP.NET Core'
        ]

        const links: {toId: string; kind: CompatibilityKind}[] = []
        const pushNamed = (names: string[], kind: CompatibilityKind) => {
            for (const name of names) {
                const target = byName.get(name.toLowerCase())
                if (!target) continue
                if (TechnologyCompatibilityModel.categoriesOverlap(
                    firebase.categories as Category[],
                    target.categories as Category[]
                )) {
                    continue
                }
                links.push({toId: target.id, kind})
            }
        }

        pushNamed(recommended, 'RECOMMENDED')
        pushNamed(worksWith, 'WORKS_WITH')

        const result = await TechnologyCompatibilityModel.replaceForTechnology(
            firebase.id,
            links,
            firebase.categories as Category[]
        )

        if (!result.ok) {
            console.warn('[Seed] Compatibilités Firebase :', result.error)
            return
        }

        console.log(`[Seed] ✅ Compatibilités Firebase : ${links.length} liens inter-catégories.`)
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
