import {INBOX_KIND, INBOX_STATUS, type InboxKind, type InboxStatus} from '../constants'
import type {CreateInboxMessageFormBean, UpdateInboxStatusFormBean} from '../dtos/core/inbox.dto'
import {asString} from './helpers'
import {fail, ok, type ValidationResult} from './types'

const KINDS = Object.values(INBOX_KIND) as InboxKind[]
const STATUSES = Object.values(INBOX_STATUS) as InboxStatus[]

/** Kinds créables depuis le client public (auth). */
const PUBLIC_CREATE_KINDS: InboxKind[] = [
    INBOX_KIND.TECH_REPORT,
    INBOX_KIND.POST_REPORT,
    INBOX_KIND.TECH_SUGGESTION,
    INBOX_KIND.ARTICLE_SUGGESTION,
    INBOX_KIND.AUTHOR_REQUEST
]

export function validateCreateInboxMessage(
    body: unknown
): ValidationResult<CreateInboxMessageFormBean> {
    if (!body || typeof body !== 'object') {
        return fail('Payload invalide.')
    }
    const raw = body as Record<string, unknown>
    const kind = asString(raw['kind']) as InboxKind
    if (!KINDS.includes(kind) || !PUBLIC_CREATE_KINDS.includes(kind)) {
        return fail('Type de message invalide.', {field: 'kind'})
    }

    const bodyText = asString(raw['body']).trim()
    if (bodyText.length < 10) {
        return fail('Message trop court (10 caractères min.).', {field: 'body'})
    }
    if (bodyText.length > 4000) {
        return fail('Message trop long (4000 caractères max.).', {field: 'body'})
    }

    const subjectRaw = asString(raw['subject']).trim()
    if (subjectRaw.length > 200) {
        return fail('Sujet trop long (200 caractères max.).', {field: 'subject'})
    }

    const technologyId = asString(raw['technologyId']).trim() || null
    const postId = asString(raw['postId']).trim() || null

    if (kind === INBOX_KIND.TECH_REPORT && !technologyId) {
        return fail('Technologie requise.', {field: 'technologyId'})
    }
    if (kind === INBOX_KIND.POST_REPORT && !postId) {
        return fail('Article requis.', {field: 'postId'})
    }

    return ok({
        kind,
        body: bodyText,
        subject: subjectRaw || undefined,
        technologyId,
        postId
    })
}

export function validateUpdateInboxStatus(
    body: unknown
): ValidationResult<UpdateInboxStatusFormBean> {
    if (!body || typeof body !== 'object') {
        return fail('Payload invalide.')
    }
    const status = asString((body as Record<string, unknown>)['status']) as InboxStatus
    if (!STATUSES.includes(status)) {
        return fail('Statut invalide.', {field: 'status'})
    }
    return ok({status})
}
