import {INBOX_KIND_LABELS, type InboxKind, type InboxMessageListed} from '@randomstack/commons'

export default class InboxMapper {

    static defaultSubject(kind: InboxKind, techName?: string | null, postTitle?: string | null): string {
        const label = INBOX_KIND_LABELS[kind]
        if (techName) return `${label} — ${techName}`
        if (postTitle) return `${label} — ${postTitle}`
        return label
    }

    static toListed(row: any): InboxMessageListed {
        return {
            id: row.id,
            kind: row.kind,
            status: row.status,
            subject: row.subject,
            body: row.body,
            technologyId: row.technologyId ?? null,
            postId: row.postId ?? null,
            author: {
                id: row.author.id,
                email: row.author.email,
                displayName: row.author.profile?.displayName || row.author.email
            },
            createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
            updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
            resolvedAt: row.resolvedAt
                ? (row.resolvedAt instanceof Date ? row.resolvedAt.toISOString() : String(row.resolvedAt))
                : null
        }
    }

    static toListedList(rows: any[]): InboxMessageListed[] {
        return rows.map(r => this.toListed(r))
    }
}
