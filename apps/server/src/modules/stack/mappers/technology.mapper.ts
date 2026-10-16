import type {
    Category,
    CompatibilityKind,
    EditTechnology,
    EditTechnologyFormBean,
    TechnologyVersion,
    PublicTechnologyListed,
    AdminTechnologyListed,
    PublicTechnologyDetail,
    TechnologyCompatLite,
    ExcludeTechnologyLite,
    DrawTechnologyLite,
    SaveTechnologyResponse
} from '@randomstack/commons'
import {StrUtils} from '#utils'

export default class TechnologyMapper {

    /** Coupe la description pour les cartes liste (évite d'envoyer le texte complet) */
    private static toPreview(description: string | null | undefined, max = 160): string | null {
        if (!description) return null
        const trimmed = description.trim()
        if (trimmed.length <= max) return trimmed
        return `${trimmed.slice(0, max).trimEnd()}…`
    }

    static getInitialFormBean(): EditTechnologyFormBean {
        return {
            name: '',
            language: '',
            categories: ['FRONTEND'],
            usage: '',
            logo: null,
            isActive: false,
            websiteUrl: '',
            docsUrl: '',
            creator: '',
            foundedAt: '',
            versions: {stable: {num: '', date: ''}, latest: {num: '', date: ''}},
            userCount: null,
            projectCount: null,
            history: [],
            description: '',
            recommendedIds: [],
            worksWithIds: [],
            incompatibleIds: []
        }
    }

    static fromDBToClientFormBean(
        tech: any,
        compatRows: {
            fromId: string
            toId: string
            kind: CompatibilityKind
            from?: {id: string}
            to?: {id: string}
        }[] = []
    ): EditTechnologyFormBean {
        const recommendedIds: string[] = []
        const worksWithIds: string[] = []
        const incompatibleIds: string[] = []

        for (const row of compatRows) {
            const otherId = row.fromId === tech.id ? row.toId : row.fromId
            if (row.kind === 'RECOMMENDED') recommendedIds.push(otherId)
            else if (row.kind === 'WORKS_WITH') worksWithIds.push(otherId)
            else if (row.kind === 'INCOMPATIBLE') incompatibleIds.push(otherId)
        }

        return {
            id: tech.id,
            name: tech.name,
            language: tech.language,
            categories: tech.categories,
            usage: tech.usage,
            logo: tech.logo,
            isActive: tech.isActive,
            websiteUrl: tech.detail?.websiteUrl || '',
            docsUrl: tech.detail?.docsUrl || '',
            creator: tech.detail?.creator || '',
            foundedAt: tech.detail?.foundedAt || '',
            versions: tech.detail?.versions || {stable: {num: '', date: ''}, latest: {num: '', date: ''}},
            userCount: tech.detail?.userCount || null,
            projectCount: tech.detail?.projectCount || null,
            history: tech.detail?.history || [],
            description: tech.detail?.description || '',
            recommendedIds: [...new Set(recommendedIds)],
            worksWithIds: [...new Set(worksWithIds)],
            incompatibleIds: [...new Set(incompatibleIds)]
        }
    }

    static buildCompatLiteFromRows(
        techId: string,
        rows: {
            kind: CompatibilityKind
            fromId: string
            toId: string
            from: {id: string; slug: string; name: string; logo: string | null; categories: Category[]}
            to: {id: string; slug: string; name: string; logo: string | null; categories: Category[]}
        }[]
    ): {compatibilities: TechnologyCompatLite[]; incompatibilities: TechnologyCompatLite[]} {
        const seen = new Set<string>()
        const compatibilities: TechnologyCompatLite[] = []
        const incompatibilities: TechnologyCompatLite[] = []

        for (const row of rows) {
            const other = row.fromId === techId ? row.to : row.from
            const key = `${other.id}:${row.kind}`
            if (seen.has(key)) continue
            seen.add(key)

            const lite: TechnologyCompatLite = {
                id: other.id,
                slug: other.slug,
                name: other.name,
                logo: other.logo,
                categories: other.categories || [],
                kind: row.kind
            }

            if (row.kind === 'INCOMPATIBLE') incompatibilities.push(lite)
            else compatibilities.push(lite)
        }

        const kindOrder = {RECOMMENDED: 0, WORKS_WITH: 1, INCOMPATIBLE: 2} as const
        compatibilities.sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind] || a.name.localeCompare(b.name, 'fr'))
        incompatibilities.sort((a, b) => a.name.localeCompare(b.name, 'fr'))

        return {compatibilities, incompatibilities}
    }

    static buildPublicTechnologyListed(tech: any): PublicTechnologyListed {
        return {
            id: tech.id,
            slug: tech.slug,
            name: tech.name,
            language: tech.language,
            logo: tech.logo,
            usage: tech.usage,
            categories: tech.categories || [],
            descriptionPreview: this.toPreview(tech.detail?.description)
        }
    }

    static buildPublicTechnologyListedList(techs: any[]): PublicTechnologyListed[] {
        return techs.map(t => this.buildPublicTechnologyListed(t))
    }

    static buildAdminTechnologyListed(tech: any): AdminTechnologyListed {
        return {
            id: tech.id,
            slug: tech.slug,
            name: tech.name,
            language: tech.language,
            logo: tech.logo,
            usage: tech.usage,
            categories: tech.categories || [],
            isActive: tech.isActive
        }
    }

    static buildAdminTechnologyListedList(techs: any[]): AdminTechnologyListed[] {
        return techs.map(t => this.buildAdminTechnologyListed(t))
    }

    static buildSaveTechnologyResponse(tech: any): SaveTechnologyResponse {
        return {
            success: true,
            technology: this.buildAdminTechnologyListed(tech)
        }
    }

    static buildPublicTechnologyDetail(
        tech: any,
        compatRows: Parameters<typeof TechnologyMapper.buildCompatLiteFromRows>[1] = []
    ): PublicTechnologyDetail {
        const {compatibilities, incompatibilities} = this.buildCompatLiteFromRows(tech.id, compatRows)
        return {
            id: tech.id,
            slug: tech.slug,
            name: tech.name,
            language: tech.language,
            logo: tech.logo,
            usage: tech.usage,
            categories: tech.categories || [],
            description: tech.detail?.description ?? null,
            history: tech.detail?.history || [],
            websiteUrl: tech.detail?.websiteUrl ?? null,
            docsUrl: tech.detail?.docsUrl ?? null,
            creator: tech.detail?.creator ?? null,
            foundedAt: tech.detail?.foundedAt ?? null,
            versions: tech.detail?.versions ?? null,
            userCount: tech.detail?.userCount ?? null,
            projectCount: tech.detail?.projectCount ?? null,
            compatibilities,
            incompatibilities
        }
    }

    static extractCompatLinksFromBody(body: {
        recommendedIds?: string[]
        worksWithIds?: string[]
        incompatibleIds?: string[]
    }): {toId: string; kind: CompatibilityKind}[] {
        const links: {toId: string; kind: CompatibilityKind}[] = []
        for (const id of body.recommendedIds || []) links.push({toId: id, kind: 'RECOMMENDED'})
        for (const id of body.worksWithIds || []) links.push({toId: id, kind: 'WORKS_WITH'})
        for (const id of body.incompatibleIds || []) links.push({toId: id, kind: 'INCOMPATIBLE'})
        return links
    }

    static buildExcludeTechnologyLite(tech: any): ExcludeTechnologyLite {
        return {
            id: tech.id,
            name: tech.name,
            slug: tech.slug,
            logo: tech.logo,
            language: tech.language,
            usage: tech.usage,
            categories: tech.categories || []
        }
    }

    static buildExcludeTechnologyLiteList(techs: any[]): ExcludeTechnologyLite[] {
        return techs.map(t => this.buildExcludeTechnologyLite(t))
    }

    static buildDrawTechnologyLite(tech: any): DrawTechnologyLite | null {
        if (!tech) return null
        return {
            id: tech.id,
            name: tech.name,
            slug: tech.slug,
            logo: tech.logo,
            language: tech.language,
            categories: tech.categories || []
        }
    }

    static toSaveTechnologyDTO(rawBody: any, targetId: string): EditTechnology {
        let versionsObj: TechnologyVersion | null = null
        if (typeof rawBody.versions === 'string' && rawBody.versions.trim() !== '') {
            try {
                versionsObj = JSON.parse(rawBody.versions)
            } catch {
                versionsObj = null
            }
        } else if (rawBody.versions && typeof rawBody.versions === 'object') {
            versionsObj = rawBody.versions
        }

        const rawCategories = rawBody.categories
        let categories: Category[]
        if (Array.isArray(rawCategories)) {
            categories = rawCategories
                .map((c: unknown) => String(c).trim())
                .filter(Boolean) as Category[]
        } else if (typeof rawCategories === 'string' && rawCategories.trim() !== '') {
            categories = rawCategories.split(',').map((c: string) => c.trim()).filter(Boolean) as Category[]
        } else {
            categories = []
        }
        if (categories.length === 0) {
            categories = ['FRONTEND']
        }

        return {
            technology: {
                id: targetId,
                name: String(rawBody.name || '').trim(),
                slug: StrUtils.slugify(rawBody.name, targetId),
                language: String(rawBody.language || '').trim(),
                logo: rawBody.logo || null,
                usage: String(rawBody.usage || '').trim(),
                categories,
                isActive: rawBody.isActive === 'true' || rawBody.isActive === true
            },
            detail: {
                description: String(rawBody.description || '').trim(),
                websiteUrl: rawBody.websiteUrl ? String(rawBody.websiteUrl).trim() : null,
                docsUrl: rawBody.docsUrl ? String(rawBody.docsUrl).trim() : null,
                creator: rawBody.creator ? String(rawBody.creator).trim() : null,
                foundedAt: rawBody.foundedAt ? String(rawBody.foundedAt).trim() : null,
                userCount: rawBody.userCount ? Number(rawBody.userCount) : null,
                projectCount: rawBody.projectCount ? Number(rawBody.projectCount) : null,
                history: Array.isArray(rawBody.history) ? rawBody.history : [],
                versions: versionsObj
            }
        }
    }

    static toSaveFromExcel(tech: any, categories: Category[], targetId: string): EditTechnology {
        const kebabName = tech.Framework.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        const slug = `${kebabName}-${targetId}`

        return {
            technology: {
                id: targetId,
                name: tech.Framework,
                slug,
                language: tech.Langage,
                logo: null,
                usage: tech.Utilisation,
                categories: categories as Category[],
                isActive: true
            },
            detail: {
                description: tech.Description || '',
                websiteUrl: null,
                docsUrl: null,
                creator: null,
                foundedAt: null,
                userCount: null,
                projectCount: null,
                history: [
                    `L'histoire de ${tech.Framework} commence avec son développement initial lié à l'écosystème ${tech.Langage}.`,
                    `Aujourd'hui, cet outil est couramment utilisé pour : ${tech.Utilisation}.`
                ],
                versions: null
            }
        }
    }
}
