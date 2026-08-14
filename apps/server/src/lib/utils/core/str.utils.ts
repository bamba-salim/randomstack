export default class StrUtils {
    static kebabName(text: string): string {
        const _text = String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        return _text.toLowerCase().replace(/\s+/g, '-')
    }

    static slugify(name: string, id: string): string {
        return `${this.kebabName(name)}-${id}`
    }
}