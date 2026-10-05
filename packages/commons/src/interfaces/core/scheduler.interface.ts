export interface ScheduledJob {
    name: string
    schedule: string
    enabled?: boolean
    run(): Promise<void>
}