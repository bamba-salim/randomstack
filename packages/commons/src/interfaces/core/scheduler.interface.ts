export interface ScheduledJob {
    name: string
    schedule: string
    enabled?: boolean
    run(): Promise<void>
}

/** Handle renvoyé par node-cron (stop gracieux). */
export interface ScheduledTask {
    stop(): void
}