import crypto from 'crypto'

export default class StrUtils {
    static kebabName(text: string): string {
        const _text = String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        return _text.toLowerCase().replace(/\s+/g, '-')
    }

    static slugify(name: string, id: string): string {
        return `${this.kebabName(name)}-${id}`
    }

    /** Code court unique pour permaliens / partage (8 hex majuscules). */
    static shareCode(bytes = 4): string {
        return crypto.randomBytes(bytes).toString('hex').toUpperCase()
    }
}