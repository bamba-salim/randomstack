import {POST_STATUS, type PostStatus} from '../constants'
import type {EditPostFormBean} from '../dtos/core/blog.dto'
import type {PostContentBlock} from '../interfaces/core/post.interface'
import {sanitizePlainText, sanitizePostContent} from '../utils/core/sanitize-html'
import {asString} from './helpers'
import {fail, failFields, ok, type ValidationResult} from './types'

const WRITE_STATUSES: PostStatus[] = [
    POST_STATUS.DRAFT,
    POST_STATUS.PUBLISHED,
    POST_STATUS.SCHEDULED,
    POST_STATUS.ARCHIVED
]

function normalizeStringList(raw: unknown): string[] {
    if (Array.isArray(raw)) {
        return raw.map(t => String(t).trim()).filter(Boolean)
    }
    if (typeof raw === 'string' && raw.trim() !== '') {
        return raw.split(',').map(t => t.trim()).filter(Boolean)
    }
    return []
}

function normalizeContent(raw: unknown): PostContentBlock[] {
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }
    return Array.isArray(raw) ? (raw as PostContentBlock[]) : []
}

/** Sauvegarde article (create / update). */
export function validateSavePost(raw: unknown): ValidationResult<EditPostFormBean> {
    const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
    const title = asString(body['title'])
    const summary = asString(body['summary'])
    const status = asString(body['status']) as PostStatus
    const errors: Record<string, string> = {}

    const cleanTitle = sanitizePlainText(title)
    const cleanSummary = sanitizePlainText(summary)

    if (!cleanTitle) errors['title'] = 'Le titre est requis.'
    else if (cleanTitle.length > 200) errors['title'] = 'Le titre est trop long (200 max).'

    if (!cleanSummary) errors['summary'] = 'Le résumé est requis.'
    else if (cleanSummary.length > 2000) errors['summary'] = 'Le résumé est trop long (2000 max).'

    if (!WRITE_STATUSES.includes(status)) {
        errors['status'] = 'Statut invalide.'
    }

    if (status === POST_STATUS.SCHEDULED) {
        const publishAt = body['publishAt']
        if (!publishAt) {
            errors['publishAt'] = 'Une date de publication est requise pour planifier.'
        } else {
            const when = new Date(String(publishAt))
            if (Number.isNaN(when.getTime()) || when <= new Date()) {
                errors['publishAt'] = 'La date de planification doit être dans le futur.'
            }
        }
    }

    if (Object.keys(errors).length > 0) return failFields(errors)

    const imageId = body['imageId'] == null || body['imageId'] === ''
        ? null
        : asString(body['imageId'])

    const authorId = body['authorId'] == null || body['authorId'] === ''
        ? null
        : asString(body['authorId'])

    const publishAt = body['publishAt'] == null || body['publishAt'] === ''
        ? null
        : String(body['publishAt'])

    return ok({
        ...(typeof body['id'] === 'string' ? {id: body['id']} : {}),
        title: cleanTitle,
        summary: cleanSummary,
        content: sanitizePostContent(normalizeContent(body['content'])),
        imageId,
        status,
        tags: normalizeStringList(body['tags']),
        sources: normalizeStringList(body['sources']),
        authorId,
        publishAt,
        hasBeenPublished: body['hasBeenPublished'] === true,
        isFeatured: Boolean(body['isFeatured']),
        ...(typeof body['slug'] === 'string' ? {slug: body['slug']} : {}),
        ...(typeof body['shareCode'] === 'string' ? {shareCode: body['shareCode']} : {})
    })
}

export function validatePostId(raw: unknown): ValidationResult<{id: string}> {
    const id = asString(raw)
    if (!id) return fail('Identifiant article manquant.', {field: 'id'})
    return ok({id})
}
