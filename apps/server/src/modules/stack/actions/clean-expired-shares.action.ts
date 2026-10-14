import StackModel from '../models/stack.model.js'

/** Purge des SavedStack dont expiresAt est dépassé (liens /draft/:code, TTL 7j). */
export default class CleanExpiredSharesAction {
    static async run(): Promise<{deleted: number}> {
        const result = await StackModel.deleteExpiredSharedStack()
        return {deleted: result.count}
    }
}
