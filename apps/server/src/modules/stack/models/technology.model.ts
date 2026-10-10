import {BaseModel} from '#abstracts'
import type {EditTechnology} from '@randomstack/commons'

export default class TechnologyModel extends BaseModel {

    static async fetchTechnologies() {
        return await this.db.technology.findMany({
            include: {detail: true},
            orderBy: {name: 'asc'}
        })
    }

    static async fetchActiveTechnologies() {
        return await this.db.technology.findMany({
            where: {isActive: true},
            include: {detail: true},
            orderBy: {name: 'asc'}
        })
    }

    static async fetchTechnologyBySlug(slug: string) {
        return await this.db.technology.findUnique({
            where: {slug},
            include: {detail: true}
        })
    }

    static async fetchTechnologyById(id: string) {
        return await this.db.technology.findUnique({
            where: {id},
            include: {detail: true}
        })
    }

    static async createTechnology(payload: EditTechnology) {
        return await this.db.technology.create({
            data: {
                ...payload.technology,
                detail: {
                    create: payload.detail
                }
            },
            include: {detail: true}
        })
    }

    static async updateTechnology(id: string, payload: EditTechnology) {
        const {id: _, slug: __, ...technologyData} = payload.technology

        return await this.db.technology.update({
            where: {id},
            data: {
                ...technologyData,
                detail: {
                    upsert: {
                        create: payload.detail,
                        update: payload.detail
                    }
                }
            },
            include: {detail: true}
        })
    }

    static async countTechnologies(): Promise<number> {
        return await this.db.technology.count()
    }

    static async getTechnologies() {
        return await this.db.technology.findMany({
            include: {detail: true},
            orderBy: {name: 'asc'}
        })
    }
}
