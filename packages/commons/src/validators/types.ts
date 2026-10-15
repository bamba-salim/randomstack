/** Résultat de validation partagé (commons → server + fronts). */
export type ValidationOk<T> = {
    ok: true
    data: T
}

export type ValidationFail = {
    ok: false
    /** Message principal (toast global / login / 1ʳᵉ erreur). */
    error: string
    /** Erreur liée à un seul champ. */
    field?: string
    /** Erreurs multi-champs (formulaires). */
    errors?: Record<string, string>
}

export type ValidationResult<T> = ValidationOk<T> | ValidationFail

export function fail(
    error: string,
    opts?: {field?: string; errors?: Record<string, string>}
): ValidationFail {
    return {
        ok: false,
        error,
        ...(opts?.field ? {field: opts.field} : {}),
        ...(opts?.errors ? {errors: opts.errors} : {})
    }
}

export function failFields(errors: Record<string, string>): ValidationFail {
    const first = Object.values(errors)[0] || 'Formulaire invalide.'
    const firstField = Object.keys(errors)[0]
    return fail(first, {field: firstField, errors})
}

export function ok<T>(data: T): ValidationOk<T> {
    return {ok: true, data}
}
