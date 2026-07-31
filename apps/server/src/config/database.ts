import { DbClient } from '#db'

export default class DatabaseConfig {
    static async checkConnection(): Promise<boolean> {
        try {
            await DbClient.client.$queryRaw`SELECT 1`
            return true
        } catch (error: any) {
            // Affiche l'erreur exacte dans le terminal pour le diagnostic
            console.error("[DatabaseConfig] Échec de connexion :", error.message || error)
            return false
        }
    }
}