import type {LoginFormBean, RegisterFormBean, EditProfileFormBean} from '../dtos/core/auth.dto'
import {asRawString, asString, isEmail, isHttpUrl} from './helpers'
import {fail, failFields, ok, type ValidationResult} from './types'

const AUTH_FAIL = 'Identifiants incorrects.'
const REGISTER_FAIL = 'Impossible de créer ce compte.'

/** Login : pas d’erreur par champ — message universel (anti-énumération). */
export function validateLogin(raw: unknown): ValidationResult<LoginFormBean> {
    const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
    const email = asString(body['email']).toLowerCase()
    const password = asRawString(body['password'])

    if (!email || !password || !isEmail(email)) {
        return fail(AUTH_FAIL)
    }

    return ok({email, password})
}

/** Register : erreurs de forme par champ ; collision email gérée côté server (opaque). */
export function validateRegister(raw: unknown): ValidationResult<RegisterFormBean> {
    const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
    const email = asString(body['email']).toLowerCase()
    const password = asRawString(body['password'])
    const passwordConfirm = asRawString(body['passwordConfirm'])
    const displayName = asString(body['displayName'])

    const errors: Record<string, string> = {}

    if (!email) errors['email'] = 'L’email est requis.'
    else if (!isEmail(email)) errors['email'] = 'Email invalide.'

    if (!password) errors['password'] = 'Le mot de passe est requis.'
    else if (password.length < 8) errors['password'] = 'Le mot de passe doit contenir au moins 8 caractères.'

    if (!passwordConfirm) errors['passwordConfirm'] = 'Confirme le mot de passe.'
    else if (password && passwordConfirm !== password) {
        errors['passwordConfirm'] = 'Les mots de passe ne correspondent pas.'
    }

    if (displayName.length > 80) errors['displayName'] = 'Le nom d’affichage est trop long (80 max).'

    if (Object.keys(errors).length > 0) return failFields(errors)

    return ok({
        email,
        password,
        ...(displayName ? {displayName} : {})
    })
}

export function validateEditProfile(raw: unknown): ValidationResult<EditProfileFormBean> {
    const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
    const displayName = asString(body['displayName'])
    const bioRaw = body['bio']
    const bio = bioRaw == null ? null : asString(bioRaw)
    const photoId = body['photoId'] == null || body['photoId'] === ''
        ? null
        : asString(body['photoId'])
    const favoritesPublic = Boolean(body['favoritesPublic'])
    const linksRaw = Array.isArray(body['links']) ? body['links'] : []

    const errors: Record<string, string> = {}

    if (!displayName) errors['displayName'] = 'Le nom d’affichage est requis.'
    else if (displayName.length > 80) errors['displayName'] = 'Le nom d’affichage est trop long (80 max).'

    if (!photoId) errors['photoId'] = 'Une photo de profil est obligatoire.'

    const links: EditProfileFormBean['links'] = []
    for (let i = 0; i < linksRaw.length; i++) {
        const item = linksRaw[i] as Record<string, unknown>
        const label = asString(item?.['label'])
        const url = asString(item?.['url'])
        if (!label && !url) continue
        if (!label || !url) {
            errors[`links.${i}`] = 'Chaque lien doit avoir un libellé et une URL.'
            continue
        }
        if (!isHttpUrl(url)) {
            errors[`links.${i}`] = `URL invalide : ${label}`
            continue
        }
        links.push({
            label,
            url,
            sortOrder: typeof item?.['sortOrder'] === 'number' ? item['sortOrder'] : i
        })
    }

    if (Object.keys(errors).length > 0) return failFields(errors)

    return ok({
        displayName,
        bio: bio || null,
        photoId,
        favoritesPublic,
        links
    })
}

export const AuthValidatorMessages = {
    AUTH_FAIL,
    REGISTER_FAIL
} as const
