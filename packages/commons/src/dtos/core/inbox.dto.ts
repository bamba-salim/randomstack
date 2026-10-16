import type {InboxKind, InboxStatus} from '../../constants'

export type CreateInboxMessageFormBean = {
    kind: InboxKind
    body: string
    subject?: string
    technologyId?: string | null
    postId?: string | null
}

export type UpdateInboxStatusFormBean = {
    status: InboxStatus
}

export type InboxMessageListed = {
    id: string
    kind: InboxKind
    status: InboxStatus
    subject: string
    body: string
    technologyId: string | null
    postId: string | null
    author: {
        id: string
        email: string
        displayName: string
    }
    createdAt: string
    updatedAt: string
    resolvedAt: string | null
}
