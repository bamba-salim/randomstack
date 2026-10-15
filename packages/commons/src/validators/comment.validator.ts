import type {CreateCommentFormBean, VoteCommentFormBean, CommentVoteType} from '../dtos/core/comment.dto'
import {asString} from './helpers'
import {fail, failFields, ok, type ValidationResult} from './types'

const MAX_CONTENT_LENGTH = 2000

export function validateCreateComment(raw: unknown): ValidationResult<CreateCommentFormBean> {
    const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
    const postId = asString(body['postId'])
    const content = asString(body['content'])
    const errors: Record<string, string> = {}

    if (!postId) errors['postId'] = 'Article manquant.'
    if (!content) errors['content'] = 'Le commentaire ne peut pas être vide.'
    else if (content.length > MAX_CONTENT_LENGTH) {
        errors['content'] = `Commentaire trop long (max ${MAX_CONTENT_LENGTH} caractères).`
    }

    if (Object.keys(errors).length > 0) return failFields(errors)
    return ok({postId, content})
}

export function validateVoteComment(raw: unknown): ValidationResult<VoteCommentFormBean> {
    const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
    const vote = body['vote']

    if (vote === null || vote === undefined || vote === '') {
        return ok({vote: null})
    }

    if (vote !== 'LIKE' && vote !== 'DISLIKE') {
        return fail('Vote invalide.', {field: 'vote'})
    }

    return ok({vote: vote as CommentVoteType})
}
