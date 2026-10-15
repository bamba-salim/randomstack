import {BLOCK_TYPE, type BlockType} from '../../constants'
import type {PostContentBlock} from '../../interfaces/core/post.interface'

const ALLOWED_TAGS = new Set([
    'b', 'strong', 'i', 'em', 'u', 's', 'br', 'p', 'span', 'a', 'code', 'mark'
])

const ALLOWED_ATTRS: Record<string, Set<string>> = {
    a: new Set(['href', 'title', 'rel', 'target']),
    span: new Set(['class']),
    p: new Set(['class']),
    code: new Set(['class'])
}

const VOID_TAGS = new Set(['br'])

/** Contenu interne jeté (XSS) — pas seulement la balise. */
const DROP_WITH_CONTENT = new Set([
    'script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'form', 'svg', 'math', 'noscript'
])

const RICH_BLOCK_TYPES = new Set<BlockType>([
    BLOCK_TYPE.TEXT,
    BLOCK_TYPE.LIST_UL,
    BLOCK_TYPE.LIST_OL
])

const PLAIN_BLOCK_TYPES = new Set<BlockType>([
    BLOCK_TYPE.H2,
    BLOCK_TYPE.H3,
    BLOCK_TYPE.QUOTE,
    BLOCK_TYPE.NDLR
])

function isSafeUrl(value: string): boolean {
    const v = value.trim().toLowerCase()
    if (v.startsWith('javascript:') || v.startsWith('data:') || v.startsWith('vbscript:')) {
        return false
    }
    return (
        v.startsWith('http:')
        || v.startsWith('https:')
        || v.startsWith('/')
        || v.startsWith('#')
        || v.startsWith('mailto:')
    )
}

function escapeText(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

function escapeAttr(value: string): string {
    return escapeText(value).replace(/'/g, '&#39;')
}

/** Strip total — titres, résumé, etc. */
export function sanitizePlainText(dirty: string): string {
    if (!dirty) return ''
    return dirty
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * Sanitize HTML riche (allowlist).
 * Navigateur : DOM. Node / Docker : parseur string (zéro dépendance npm).
 */
export function sanitizeHtml(dirty: string): string {
    if (!dirty) return ''

    if (typeof document !== 'undefined') {
        return sanitizeWithDom(dirty)
    }
    return sanitizeWithParser(dirty)
}

function sanitizeWithDom(dirty: string): string {
    const template = document.createElement('template')
    template.innerHTML = dirty
    walkDom(template.content)
    return template.innerHTML
}

function walkDom(node: ParentNode): void {
    const children = Array.from(node.childNodes)
    for (const child of children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
            const el = child as HTMLElement
            const tag = el.tagName.toLowerCase()

            if (!ALLOWED_TAGS.has(tag)) {
                if (DROP_WITH_CONTENT.has(tag)) {
                    node.removeChild(el)
                } else {
                    while (el.firstChild) {
                        node.insertBefore(el.firstChild, el)
                    }
                    node.removeChild(el)
                }
                continue
            }

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

            walkDom(el)
        } else if (child.nodeType === Node.COMMENT_NODE) {
            node.removeChild(child)
        }
    }
}

type Frag =
    | {kind: 'text'; value: string}
    | {kind: 'tag'; name: string; attrs: Record<string, string>; selfClosing: boolean; children: Frag[]}

/**
 * Parseur HTML minimal allowlist (suffisant pour le sous-ensemble éditorial).
 * Plus permissif qu’un strip total, plus sûr qu’un HTML brut.
 */
function sanitizeWithParser(dirty: string): string {
    const frags = parseFragments(dirty)
    return renderFragments(frags)
}

function parseFragments(input: string): Frag[] {
    const out: Frag[] = []
    const stack: {name: string; attrs: Record<string, string>; children: Frag[]}[] = []
    let i = 0

    const push = (frag: Frag) => {
        const parent = stack[stack.length - 1]
        if (parent) parent.children.push(frag)
        else out.push(frag)
    }

    while (i < input.length) {
        if (input[i] === '<') {
            const close = input.indexOf('>', i + 1)
            if (close === -1) {
                push({kind: 'text', value: input.slice(i)})
                break
            }
            const raw = input.slice(i + 1, close).trim()
            i = close + 1

            if (!raw || raw.startsWith('!') || raw.startsWith('?')) continue

            if (raw.startsWith('/')) {
                const name = raw.slice(1).trim().toLowerCase().split(/\s+/)[0] || ''
                while (stack.length) {
                    const top = stack.pop()!
                    const frag: Frag = {
                        kind: 'tag',
                        name: top.name,
                        attrs: top.attrs,
                        selfClosing: false,
                        children: top.children
                    }
                    if (top.name === name) {
                        push(frag)
                        break
                    }
                    // balise mal fermée : on remonte en textifiant
                    push(frag)
                }
                continue
            }

            const selfClosing = raw.endsWith('/')
            const body = selfClosing ? raw.slice(0, -1).trim() : raw
            const nameMatch = /^([a-zA-Z][\w:-]*)/.exec(body)
            if (!nameMatch) continue
            const name = nameMatch[1].toLowerCase()
            const attrs = parseAttrs(body.slice(nameMatch[0].length))

            if (!ALLOWED_TAGS.has(name)) {
                // script/style/… : drop balise + contenu jusqu’à la fermeture
                if (!selfClosing && !VOID_TAGS.has(name) && DROP_WITH_CONTENT.has(name)) {
                    const closer = new RegExp(`</${name}\\s*>`, 'i')
                    const rest = input.slice(i)
                    const m = closer.exec(rest)
                    if (m && m.index != null) {
                        i += m.index + m[0].length
                    } else {
                        i = input.length
                    }
                }
                // autres balises non autorisées : unwrap (le texte suit en siblings)
                continue
            }

            const cleanAttrs = filterAttrs(name, attrs)
            if (selfClosing || VOID_TAGS.has(name)) {
                push({kind: 'tag', name, attrs: cleanAttrs, selfClosing: true, children: []})
            } else {
                stack.push({name, attrs: cleanAttrs, children: []})
            }
            continue
        }

        const next = input.indexOf('<', i)
        const text = next === -1 ? input.slice(i) : input.slice(i, next)
        i = next === -1 ? input.length : next
        if (text) push({kind: 'text', value: text})
    }

    while (stack.length) {
        const top = stack.pop()!
        push({
            kind: 'tag',
            name: top.name,
            attrs: top.attrs,
            selfClosing: false,
            children: top.children
        })
    }

    return out
}

function parseAttrs(raw: string): Record<string, string> {
    const attrs: Record<string, string> = {}
    const re = /([:@\w.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g
    let m: RegExpExecArray | null
    while ((m = re.exec(raw))) {
        attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? ''
    }
    return attrs
}

function filterAttrs(tag: string, attrs: Record<string, string>): Record<string, string> {
    const allowed = ALLOWED_ATTRS[tag]
    const out: Record<string, string> = {}
    if (!allowed) return out

    for (const [key, value] of Object.entries(attrs)) {
        if (!allowed.has(key)) continue
        if ((key === 'href' || key === 'src') && !isSafeUrl(value)) continue
        out[key] = value
    }
    if (out['target']) out['rel'] = 'noopener noreferrer'
    return out
}

function renderFragments(frags: Frag[]): string {
    let html = ''
    for (const frag of frags) {
        if (frag.kind === 'text') {
            html += escapeText(frag.value)
            continue
        }
        const attrStr = Object.entries(frag.attrs)
            .map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
            .join('')
        if (frag.selfClosing) {
            html += `<${frag.name}${attrStr}>`
        } else {
            html += `<${frag.name}${attrStr}>${renderFragments(frag.children)}</${frag.name}>`
        }
    }
    return html
}

function sanitizeBlock(block: unknown): PostContentBlock | null {
    if (!block || typeof block !== 'object') return null
    const raw = block as Record<string, unknown>
    const type = String(raw['type'] || '') as BlockType

    const base: PostContentBlock = {
        type,
        value: String(raw['value'] ?? ''),
        ...(raw['caption'] != null ? {caption: String(raw['caption'])} : {}),
        ...(raw['language'] != null ? {language: String(raw['language'])} : {})
    }

    if (RICH_BLOCK_TYPES.has(type)) {
        base.value = sanitizeHtml(base.value)
    } else if (PLAIN_BLOCK_TYPES.has(type)) {
        base.value = sanitizePlainText(base.value)
    } else if (type === BLOCK_TYPE.CODE) {
        base.value = String(raw['value'] ?? '')
        if (base.language) base.language = sanitizePlainText(base.language)
    } else if (type === BLOCK_TYPE.IMAGE || type === BLOCK_TYPE.VIDEO) {
        base.value = sanitizePlainText(base.value)
        if (base.caption) base.caption = sanitizePlainText(base.caption)
    } else if (type === BLOCK_TYPE.DOUBLE_CONTENT) {
        base.value = ''
        base.left = sanitizeBlock(raw['left'])
        base.right = sanitizeBlock(raw['right'])
    } else {
        base.value = sanitizePlainText(base.value)
    }

    return base
}

/** Nettoie récursivement le JSON content d’un article avant persistance. */
export function sanitizePostContent(content: unknown): PostContentBlock[] {
    if (!Array.isArray(content)) return []
    return content
        .map(sanitizeBlock)
        .filter((b): b is PostContentBlock => Boolean(b))
}
