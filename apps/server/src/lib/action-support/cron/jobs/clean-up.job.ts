import cron from 'node-cron'
import { StackModel } from '#models'

export default class CleanUpJob {
    static start(): void {
        console.log("[Cron] 🕒 Tâche [CleanupJob] enregistrée (Exécution : tous les jours à minuit).")
        cron.schedule('0 0 * * *', async () => {
            console.log("[Cron] ⚙️ [CleanupJob] Lancement de la purge des liens de partage expirés...")
            try {
                const result = await StackModel.deleteExpiredSharedStack()
                console.log(`[Cron] ✅ [CleanupJob] Purge terminée. ${result.count} liens expirés supprimés.`)
            } catch (error: any) {
                console.error("[Cron] ❌ [CleanupJob] Échec de la purge :", error.message || error)
            }
        })
    }
}