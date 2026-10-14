import type {ScheduledJob} from '@randomstack/commons'
import {cleanExpiredStacksJob} from './core/clean-expired-stacks.job'
import {cleanOrphanFilesJob} from './core/clean-orphan-files.job'
import {publishScheduledPostsJob} from './core/publish-scheduled-posts.job'
import {purgeDeletedPostsJob} from './core/purge-deleted-posts.job'

export const registeredJobs: ScheduledJob[] = [
    cleanExpiredStacksJob,
    cleanOrphanFilesJob,
    publishScheduledPostsJob,
    purgeDeletedPostsJob
]
