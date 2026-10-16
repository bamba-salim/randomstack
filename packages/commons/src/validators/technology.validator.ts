import {TECHNOLOGY_CATEGORY, type Category} from '../constants'
import type {EditTechnologyFormBean} from '../dtos/core/stack.dto'
import type {TechnologyVersion} from '../interfaces/core/technology.interface'
import {asString, isHttpUrl} from './helpers'
import {failFields, ok, type ValidationResult} from './types'

const CATEGORIES = Object.values(TECHNOLOGY_CATEGORY) as Category[]

function normalizeCategories(raw: unknown): Category[] {
    const list = Array.isArray(raw)
        ? raw.map(c => String(c).trim()).filter(Boolean)
        : typeof raw === 'string' && raw.trim() !== ''
            ? raw.split(',').map(c => c.trim()).filter(Boolean)
            : []

    return list.filter((c): c is Category => CATEGORIES.includes(c as Category))
}

function normalizeHistory(raw: unknown): string[] {
    if (!Array.isArray(raw)) return []
    return raw.map(p => String(p ?? '').trim()).filter(Boolean)
}

function normalizeIdList(raw: unknown): string[] {
    if (!Array.isArray(raw)) return []
    return [...new Set(raw.map(id => String(id ?? '').trim()).filter(Boolean))]
}

function normalizeOptionalUrl(
    raw: unknown,
    field: string,
    errors: Record<string, string>
): string | null {
    const value = asString(raw)
    if (!value) return null
    if (!isHttpUrl(value)) {
        errors[field] = 'URL invalide (http/https requis).'
        return null
    }
    return value
}

function normalizeOptionalCount(
    raw: unknown,
    field: string,
    errors: Record<string, string>
): number | null {
    if (raw == null || raw === '') return null
    const n = Number(raw)
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
        errors[field] = 'Doit être un entier positif ou nul.'
        return null
    }
    return n
}

function normalizeVersions(raw: unknown): TechnologyVersion | null {
    if (!raw || typeof raw !== 'object') return null
    const v = raw as Record<string, any>
    const stable = v['stable'] && typeof v['stable'] === 'object' ? v['stable'] : {}
    const latest = v['latest'] && typeof v['latest'] === 'object' ? v['latest'] : {}

    const result: TechnologyVersion = {
        stable: {
            num: asString(stable['num']),
            date: asString(stable['date'])
        },
        latest: {
            num: asString(latest['num']),
            date: asString(latest['date'])
        }
    }

    const allEmpty =
        !result.stable.num
        && !result.stable.date
        && !result.latest.num
        && !result.latest.date

    return allEmpty ? null : result
}

/** Sauvegarde techno (create / update). */
export function validateSaveTechnology(raw: unknown): ValidationResult<EditTechnologyFormBean> {
    const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
    const name = asString(body['name'])
    const language = asString(body['language'])
    const usage = asString(body['usage'])
    const description = asString(body['description'])
    const categories = normalizeCategories(body['categories'])
    const errors: Record<string, string> = {}

    if (!name) errors['name'] = 'Le nom est requis.'
    else if (name.length > 120) errors['name'] = 'Le nom est trop long (120 max).'

    if (!language) errors['language'] = 'Le langage est requis.'
    else if (language.length > 80) errors['language'] = 'Le langage est trop long (80 max).'

    if (!usage) errors['usage'] = 'L’utilisation est requise.'
    else if (usage.length > 200) errors['usage'] = 'L’utilisation est trop longue (200 max).'

    if (categories.length === 0) {
        errors['categories'] = 'Sélectionne au moins une catégorie valide.'
    }

    if (!description) errors['description'] = 'La description est requise.'
    else if (description.length > 5000) errors['description'] = 'La description est trop longue (5000 max).'

    const websiteUrl = normalizeOptionalUrl(body['websiteUrl'], 'websiteUrl', errors)
    const docsUrl = normalizeOptionalUrl(body['docsUrl'], 'docsUrl', errors)
    const userCount = normalizeOptionalCount(body['userCount'], 'userCount', errors)
    const projectCount = normalizeOptionalCount(body['projectCount'], 'projectCount', errors)

    const creator = asString(body['creator']) || null
    const foundedAt = asString(body['foundedAt']) || null
    if (creator && creator.length > 120) errors['creator'] = 'Le créateur est trop long (120 max).'
    if (foundedAt && foundedAt.length > 40) errors['foundedAt'] = 'La date/année est trop longue (40 max).'

    const logo = body['logo'] == null || body['logo'] === ''
        ? null
        : asString(body['logo'])

    if (Object.keys(errors).length > 0) return failFields(errors)

    return ok({
        ...(typeof body['id'] === 'string' ? {id: body['id']} : {}),
        name,
        language,
        categories,
        usage,
        logo,
        isActive: body['isActive'] === true || body['isActive'] === 'true',
        description,
        websiteUrl,
        docsUrl,
        creator,
        foundedAt,
        userCount,
        projectCount,
        history: normalizeHistory(body['history']),
        versions: normalizeVersions(body['versions']),
        recommendedIds: normalizeIdList(body['recommendedIds']),
        worksWithIds: normalizeIdList(body['worksWithIds']),
        incompatibleIds: normalizeIdList(body['incompatibleIds'])
    })
}
