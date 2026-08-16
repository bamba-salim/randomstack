import crypto from 'crypto'

import type {Category, EditTechnology, EditTechnologyFormBean, TechnoLogyVersion} from '@randomstack/commons'
import {StrUtils} from '#utils'

export default class TechnologyMapper {

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


    static fromDBToClientFormBean(tech: PrismaTech & { detail: PrismaDetail | null }): EditTechnologyFormBean {
        return {
            id: tech.id,
            name: tech.name,
            language: tech.language,
            categories: tech.categories as any,
            usage: tech.usage,
            logo: tech.logo ? `http://localhost:4000${tech.logo}` : null,
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

        }
    }


    static toSaveTechnologyDTO(rawBody: any, logoUrl: string | null, targetId: string): EditTechnology {


        let versionsObj: TechnoLogyVersion | null = null
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
                logo: logoUrl,
                usage: String(rawBody.usage || '').trim(),
                categories: Array.isArray(rawCategories) ? rawCategories : (typeof rawCategories === 'string' && rawCategories.trim() !== '' ? rawCategories.split(',').map(c => c.trim()).filter(Boolean) : ['FRONTEND']),
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