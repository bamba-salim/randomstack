/**
 * Sanitize basique anti-XSS pour le HTML riche des blocs article.
 * Autorise un sous-ensemble de balises ; retire scripts, handlers, javascript:.
 */
const ALLOWED_TAGS = new Set([
    'b', 'strong', 'i', 'em', 'u', 's', 'br', 'p', 'span', 'a', 'code', 'mark'
])

const ALLOWED_ATTRS: Record<string, Set<string>> = {
    a: new Set(['href', 'title', 'rel', 'target']),
    span: new Set(['class']),
    p: new Set(['class']),
    code: new Set(['class'])
}

function isSafeUrl(value: string): boolean {
    const v = value.trim().toLowerCase()
    if (v.startsWith('javascript:') || v.startsWith('data:') || v.startsWith('vbscript:')) {
        return false
    }
    return v.startsWith('http:') || v.startsWith('https:') || v.startsWith('/') || v.startsWith('#') || v.startsWith('mailto:')
}

export function sanitizeHtml(dirty: string): string {
    if (!dirty) return ''

    // Navigateur : parse + filtre
    if (typeof document !== 'undefined') {
        const template = document.createElement('template')
        template.innerHTML = dirty
        walk(template.content)
        return template.innerHTML
    }

    // SSR / fallback : strip tags dangereux
    return dirty
        .replace(/<(script|style|iframe|object|embed|link|meta|form)[\s\S]*?>[\s\S]*?<\/\1>/gi, '')
        .replace(/<(script|style|iframe|object|embed|link|meta|form)[^>]*\/?>/gi, '')
        .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1=$2#$2')
}

function walk(node: Node): void {
    const children = Array.from(node.childNodes)
    for (const child of children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
            const el = child as HTMLElement
            const tag = el.tagName.toLowerCase()

            if (!ALLOWED_TAGS.has(tag)) {
                // Conserve le texte interne
                while (el.firstChild) {
                    node.insertBefore(el.firstChild, el)
                }
                node.removeChild(el)
                continue
            }

            // Attrs
            for (const attr of Array.from(el.attributes)) {
                const name = attr.name.toLowerCase()
                const allowed = ALLOWED_ATTRS[tag]
                if (!allowed || !allowed.has(name)) {
                    el.removeAttribute(attr.name)
                    continue
                }
                if ((name === 'href' || name === 'src') && !isSafeUrl(attr.value)) {
                    el.removeAttribute(attr.name)
                }
                if (name === 'target') {
                    el.setAttribute('rel', 'noopener noreferrer')
                }
            }

            walk(el)
        } else if (child.nodeType === Node.COMMENT_NODE) {
            node.removeChild(child)
        }
    }
}
