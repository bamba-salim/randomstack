import crypto from 'crypto'

import type {Category, EditTechnology, EditTechnologyFormBean} from '@randomstack/commons'


export default class TechnologyMapper {

    static getInitialFormBean(): EditTechnologyFormBean {
        return {
            name: '',
            language: '',
            categories: ['FRONTEND'],
            usage: '',
            description: '',
            websiteUrl: '',
            docsUrl: '',
            creator: '',
            foundedAt: '',
            userCount: null,
            projectCount: null,
            logo: null
        }
    }

    static fromDBToClientFormBean(tech: PrismaTech & { detail: PrismaDetail | null }): EditTechnologyFormBean {
        return {
            id: tech.id,
            name: tech.name,
            language: tech.language,
            categories: tech.categories as any,
            usage: tech.usage,
            description: tech.detail?.description || '',
            websiteUrl: tech.detail?.websiteUrl || '',
            docsUrl: tech.detail?.docsUrl || '',
            creator: tech.detail?.creator || '',
            foundedAt: tech.detail?.foundedAt || '',
            userCount: tech.detail?.userCount || null,
            projectCount: tech.detail?.projectCount || null,
            logo: tech.logo || null
        }
    }

    static toSaveTechnologyDTO(rawBody: any, logoUrl: string | null, targetId: string): EditTechnology {
        let categoriesList: Category[] = []
        const rawCategories = rawBody.categories

        if (Array.isArray(rawCategories)) {
            categoriesList = rawCategories as Category[]
        } else if (typeof rawCategories === 'string' && rawCategories.trim() !== '') {
            categoriesList = rawCategories
                .split(',')
                .map(c => c.trim())
                .filter(Boolean) as Category[]
        }

        if (categoriesList.length === 0) {
            categoriesList = ['FRONTEND']
        }

        const kebabName = String(rawBody.name || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        const slug = `${kebabName}-${targetId}`

        return {
            technology: {
                id: targetId,
                name: String(rawBody.name || '').trim(),
                slug,
                language: String(rawBody.language || '').trim(),
                logo: logoUrl,
                usage: String(rawBody.usage || '').trim(),
                categories: categoriesList
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
                versions: rawBody.versions || null
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
                categories: categories as any
            },
            detail: {
                id: targetId,
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