import {USER_ROLE, type Role} from '../constants'
import type {CreateUserFormBean, UpdateUserRoleFormBean} from '../dtos/core/user.dto'
import {asRawString, asString, isEmail} from './helpers'
import {fail, failFields, ok, type ValidationResult} from './types'

const ROLES = Object.values(USER_ROLE) as Role[]

export function validateCreateUser(raw: unknown): ValidationResult<CreateUserFormBean> {
    const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
    const email = asString(body['email']).toLowerCase()
    const password = asRawString(body['password'])
    const passwordConfirm = asRawString(body['passwordConfirm'])
    const displayName = asString(body['displayName'])
    const role = asString(body['role']) as Role
    const errors: Record<string, string> = {}

    if (!email) errors['email'] = 'L’email est requis.'
    else if (!isEmail(email)) errors['email'] = 'Email invalide.'

    if (!password) errors['password'] = 'Le mot de passe est requis.'
    else if (password.length < 8) errors['password'] = 'Le mot de passe doit contenir au moins 8 caractères.'

    if (!passwordConfirm) errors['passwordConfirm'] = 'Confirme le mot de passe.'
    else if (password && passwordConfirm !== password) {
        errors['passwordConfirm'] = 'Les mots de passe ne correspondent pas.'
    }

    if (!displayName) errors['displayName'] = 'Le nom d’affichage est requis.'
    else if (displayName.length > 80) errors['displayName'] = 'Le nom d’affichage est trop long (80 max).'

    if (!role || !ROLES.includes(role)) errors['role'] = 'Rôle invalide.'

    if (Object.keys(errors).length > 0) return failFields(errors)

    return ok({email, password, displayName, role})
}

export function validateUpdateUserRole(raw: unknown): ValidationResult<UpdateUserRoleFormBean> {
    const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
    const role = asString(body['role']) as Role

    if (!role || !ROLES.includes(role)) {
        return fail('Rôle invalide.', {field: 'role'})
    }

    return ok({role})
}
