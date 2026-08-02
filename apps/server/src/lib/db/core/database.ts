import {PrismaClient} from '@prisma/client'
import {PrismaPg} from '@prisma/adapter-pg'

export default class Database {

    private static prismaInstance: PrismaClient

    // 1. Gestion de la connexion unique (Prisma Client) 🚀
    static get client(): PrismaClient {
        if (!this.prismaInstance) {
            const adapter = new PrismaPg({connectionString: process.env['DATABASE_URL'] as string})
            this.prismaInstance = new PrismaClient({adapter})
        }
        return this.prismaInstance
    }

    // 2. Test de connexion (Healthcheck) unifié ici 🚀
    static async checkConnection(): Promise<boolean> {
        try {
            await this.client.$queryRaw`SELECT 1`
            return true
        } catch (error: any) {
            console.error("[Database] Échec de la connexion à PostgreSQL :", error.message || error)
            return false
        }
    }
}