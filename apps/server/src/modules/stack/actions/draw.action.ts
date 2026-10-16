import type {Category, DrawnStack} from '@randomstack/commons'
import {DRAW_ELIGIBLE_CATEGORIES, DRAW_SERVER_CATEGORIES} from '@randomstack/commons'
import TechnologyMapper from '../mappers/technology.mapper'
import StackMapper from '../mappers/stack.mapper'

const DRAW_SET = new Set<string>(DRAW_ELIGIBLE_CATEGORIES)

export default class DrawAction {
    static run(techs: any[]): DrawnStack {
        const getByCategory = (cats: readonly Category[]) => {
            const filtered = techs.filter(t => {
                if (!Array.isArray(t.categories) || t.categories.length === 0) return false
                // Hors couches tirables (API, CMS, LIBRARY, ORM…) → hors générateur
                const drawable = t.categories.filter((cat: Category) => DRAW_SET.has(cat))
                if (drawable.length === 0) return false
                return drawable.some((cat: Category) => cats.includes(cat))
            })
            if (filtered.length === 0) return null
            const randomIndex = Math.floor(Math.random() * filtered.length)
            return TechnologyMapper.buildDrawTechnologyLite(filtered[randomIndex])
        }

        return StackMapper.buildDrawnStack(
            getByCategory(['FRONTEND', 'MOBILE', 'DESKTOP']),
            getByCategory(DRAW_SERVER_CATEGORIES),
            getByCategory(['DATABASE'])
        )
    }
}
