const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** UUID v1–v5 (forme canonique avec tirets). */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function asString(value: unknown): string {
    return String(value ?? '').trim()
}

export function asRawString(value: unknown): string {
    return String(value ?? '')
}

export function isEmail(value: string): boolean {
    return EMAIL_RE.test(value)
}

export function isUuid(value: string): boolean {
    return UUID_RE.test(value)
}

export function isHttpUrl(value: string): boolean {
    try {
        const parsed = new URL(value)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
        return false
    }
}
