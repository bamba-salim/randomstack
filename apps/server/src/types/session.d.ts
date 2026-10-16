import type {DrawnStack} from '@randomstack/commons'
import 'express-session'

declare module 'express-session' {
    interface SessionData {
        userId?: string
        userRole?: string
        history?: DrawnStack[]
    }
}

export {}
