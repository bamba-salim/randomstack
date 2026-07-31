import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg' // <-- Ajout de l'adaptateur Prisma v7

export default class DbClient {
    private static instance: PrismaClient

    static get client(): PrismaClient {
        if (!this.instance) {
            // Création de l'adaptateur de connexion Postgres native
            const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] as string })

            // On passe l'adaptateur requis à l'instanciation de PrismaClient
            this.instance = new PrismaClient({ adapter })
        }
        return this.instance
    }
}