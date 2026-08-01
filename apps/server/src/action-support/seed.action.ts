import fs from 'fs'
import path from 'path'
import { DbClient } from '#db'
import type { Category } from '@prisma/client'

interface RawExcelTech {
    Langage: string
    Framework: string
    Utilisation: string
    Description: string
}

export default class SeedAction {
    static async execute(): Promise<void> {

        try {
            // 1. Vérification du nombre d'éléments existants
            const count = await DbClient.client.technology.count()

            if (count > 0) {
                return
            }

            // 2. Recherche tolérante du fichier (gère technologies.json ou techno.json)
            let filePath = path.resolve(process.cwd(), 'technologies.json')
            if (!fs.existsSync(filePath)) {
                filePath = path.resolve(process.cwd(), 'techno.json')
            }

            if (!fs.existsSync(filePath)) {
                console.error(`[Seed] ❌ ERREUR CRITIQUE : Aucun fichier 'technologies.json' ou 'techno.json' trouvé dans /apps/server/ (Dossier courant : ${process.cwd()})`)
                return
            }


            // 3. Lecture et parsing du JSON
            const rawData = fs.readFileSync(filePath, 'utf-8')
            const rawTechs: RawExcelTech[] = JSON.parse(rawData)

            // 4. Ingestion dans PostgreSQL
            let importedCount = 0
            for (const tech of rawTechs) {
                const category = this.determineCategory(tech.Utilisation)

                await DbClient.client.technology.upsert({
                    where: { name: tech.Framework },
                    update: {},
                    create: {
                        name: tech.Framework,
                        language: tech.Langage,
                        logo: null,
                        usage: tech.Utilisation,
                        description: tech.Description,
                        category: category
                    }
                })
                importedCount++
            }
            console.log(`[Seed] ✅ INGESTION TERMINÉE : ${importedCount} technologies importées avec succès !`)
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
}