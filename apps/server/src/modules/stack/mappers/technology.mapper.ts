import type {
    Category,
    EditTechnology,
    EditTechnologyFormBean,
    TechnologyVersion,
    PublicTechnologyListed,
    AdminTechnologyListed,
    PublicTechnologyDetail,
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
            description: ''
        }
    }

    static fromDBToClientFormBean(tech: any): EditTechnologyFormBean {
        return {
            id: tech.id,
            name: tech.name,
            language: tech.language,
            categories: tech.categories,
            usage: tech.usage,
            logo: tech.logo,
            isActive: tech.isActive,
            websiteUrl: tech.info?.websiteUrl || '',
            docsUrl: tech.info?.docsUrl || '',
            creator: tech.info?.creator || '',
            foundedAt: tech.info?.foundedAt || '',
            versions: tech.info?.versions || {stable: {num: '', date: ''}, latest: {num: '', date: ''}},
            userCount: tech.info?.userCount || null,
            projectCount: tech.info?.projectCount || null,
            history: tech.info?.history || [],
            description: tech.info?.description || ''
        }
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
            descriptionPreview: this.toPreview(tech.info?.description)
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

    static buildPublicTechnologyDetail(tech: any): PublicTechnologyDetail {
        return {
            id: tech.id,
            slug: tech.slug,
            name: tech.name,
            language: tech.language,
            logo: tech.logo,
            usage: tech.usage,
            categories: tech.categories || [],
            description: tech.info?.description ?? null,
            history: tech.info?.history || [],
            websiteUrl: tech.info?.websiteUrl ?? null,
            docsUrl: tech.info?.docsUrl ?? null,
            creator: tech.info?.creator ?? null,
            foundedAt: tech.info?.foundedAt ?? null,
            versions: tech.info?.versions ?? null,
            userCount: tech.info?.userCount ?? null,
            projectCount: tech.info?.projectCount ?? null
        }
    }

    static buildExcludeTechnologyLite(tech: any): ExcludeTechnologyLite {
        return {
            id: tech.id,
            name: tech.name,
            logo: tech.logo,
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

        return {
            technology: {
                id: targetId,
                name: String(rawBody.name || '').trim(),
                slug: StrUtils.slugify(rawBody.name, targetId),
                language: String(rawBody.language || '').trim(),
                logo: rawBody.logo || null,
                usage: String(rawBody.usage || '').trim(),
                categories: Array.isArray(rawCategories)
                    ? rawCategories
                    : (typeof rawCategories === 'string' && rawCategories.trim() !== ''
                        ? rawCategories.split(',').map((c: string) => c.trim()).filter(Boolean)
                        : ['FRONTEND']),
                isActive: rawBody.isActive === 'true' || rawBody.isActive === true
            },
            info: {
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
            info: {
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
