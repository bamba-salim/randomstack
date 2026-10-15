const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function asString(value: unknown): string {
    return String(value ?? '').trim()
}

export function asRawString(value: unknown): string {
    return String(value ?? '')
}

export function isEmail(value: string): boolean {
    return EMAIL_RE.test(value)
}

export function isHttpUrl(value: string): boolean {
    try {
        const parsed = new URL(value)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
        return false
    }
}
