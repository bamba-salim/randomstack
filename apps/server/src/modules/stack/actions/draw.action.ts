import type {Category, DrawnStack} from '@randomstack/commons'
import TechnologyMapper from '../mappers/technology.mapper'
import StackMapper from '../mappers/stack.mapper'

export default class DrawAction {
    static run(techs: any[]): DrawnStack {
        const getByCategory = (cats: Category[]) => {
            const filtered = techs.filter(t =>
                Array.isArray(t.categories) && t.categories.some((cat: Category) => cats.includes(cat))
            )
            if (filtered.length === 0) return null
            const randomIndex = Math.floor(Math.random() * filtered.length)
            return TechnologyMapper.buildDrawTechnologyLite(filtered[randomIndex])
        }

        return StackMapper.buildDrawnStack(
            getByCategory(['FRONTEND', 'MOBILE', 'DESKTOP']),
            getByCategory(['BACKEND']),
            getByCategory(['DATABASE'])
        )
    }
}
