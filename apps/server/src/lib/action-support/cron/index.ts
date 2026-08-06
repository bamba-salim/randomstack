import CleanupJob from './jobs/clean-up.job'

export default class CronJobs {
    static boot(): void {
        console.log("[Cron] 🕒 Initialisation de l'ordonnanceur de tâches...")
        CleanupJob.start()
    }
}