import {BaseModel} from '#abstracts'
import type {EditTechnology} from '@randomstack/commons'

export default class TechnologyModel extends BaseModel {

    static async fetchTechnologies() {
        return await this.db.technology.findMany({
            include: {info: true},
            orderBy: {name: 'asc'}
        })
    }

    static async fetchActiveTechnologies() {
        return await this.db.technology.findMany({
            where: {isActive: true},
            include: {info: true},
            orderBy: {name: 'asc'}
        })
    }

    static async fetchTechnologyBySlug(slug: string) {
        return await this.db.technology.findUnique({
            where: {slug},
            include: {info: true}
        })
    }

    static async fetchTechnologyById(id: string) {
        return await this.db.technology.findUnique({
            where: {id},
            include: {info: true}
        })
    }

    static async createTechnology(payload: EditTechnology) {
        return await this.db.technology.create({
            data: {
                ...payload.technology,
                info: {
                    create: payload.info
                }
            },
            include: {info: true}
        })
    }

    static async updateTechnology(id: string, payload: EditTechnology) {
        const {id: _, slug: __, ...technologyData} = payload.technology

        return await this.db.technology.update({
            where: {id},
            data: {
                ...technologyData,
                info: {
                    upsert: {
                        create: payload.info,
                        update: payload.info
                    }
                }
            },
            include: {info: true}
        })
    }

    static async countTechnologies(): Promise<number> {
        return await this.db.technology.count()
    }

    static async getTechnologies() {
        return await this.db.technology.findMany({
            include: {info: true},
            orderBy: {name: 'asc'}
        })
    }
}
