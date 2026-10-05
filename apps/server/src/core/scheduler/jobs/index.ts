import type { ScheduledJob } from '@randomstack/commons'
import { cleanExpiredStacksJob } from './core/clean-expired-stacks.job'

export const registeredJobs: ScheduledJob[] = [
    cleanExpiredStacksJob
]