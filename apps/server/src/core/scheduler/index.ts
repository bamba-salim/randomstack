import cron from 'node-cron'
import { registeredJobs } from './jobs'
import type { ScheduledTask } from '@randomstack/commons'

const runningTasks: ScheduledTask[] = []

export const initScheduler = (): void => {
    console.log('[SCHEDULER] Initialisation des tâches planifiées...')

    for (const job of registeredJobs) {
        if (job.enabled === false) {
            console.log(`[SCHEDULER] ⏸️ Tâche désactivée : ${job.name}`)
            continue
        }

        const task = cron.schedule(job.schedule, async () => {
            const start = Date.now()
            console.log(`[JOB START] ⏳ ${job.name}`)

            try {
                await job.run()
                const duration = Date.now() - start
                console.log(`[JOB SUCCESS] ✅ ${job.name} (${duration}ms)`)
            } catch (error) {
                console.error(`[JOB ERROR] ❌ Échec sur ${job.name} :`, error)
            }
        })

        runningTasks.push(task)
        console.log(`[SCHEDULER] 🕒 Planifié : "${job.name}" [${job.schedule}]`)
    }
}

// Permet d'arrêter proprement les crons si le conteneur s'éteint
export const stopScheduler = (): void => {
    console.log('[SCHEDULER] Arrêt de toutes les tâches planifiées...')
    runningTasks.forEach(task => task.stop())
}