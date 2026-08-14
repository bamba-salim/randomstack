import {Database} from '#db'
import type {EditTechnology} from '@randomstack/commons'

export default class TechnologyModel {

    static async fetchTechnologies() { // Nom explicite et verbeux 🚀
        return await Database.client.technology.findMany({
            include: {detail: true},
            orderBy: {name: 'asc'}
        })
    }

    static async fetchTechnologyById(id: string) { // Nom explicite et verbeux 🚀
        return await Database.client.technology.findUnique({
            where: {id},
            include: {detail: true}
        })
    }

    static async fetchTechnologyBySlug(slug: string) { // Nom explicite et verbeux 🚀
        return await Database.client.technology.findUnique({
            where: {slug},
            include: {detail: true}
        })
    }

    static async createTechnology(payload: EditTechnology) { // Nom explicite et verbeux 🚀

        const { id: _, ...detailWithoutId } = payload.detail

        return await Database.client.technology.create({


            data: {
                ...payload.technology,
                detail: {
                    create: detailWithoutId
                }
            },
            include: {detail: true}
        })
    }

    static async updateTechnology(id: string, payload: EditTechnology) { // Nom sémantique 🚀
        const {id: _, slug: __, ...technologyData} = payload.technology

        return await Database.client.technology.update({
            where: {id},
            data: {
                ...technologyData,
                detail: {
                    update: payload.detail
                }
            },
            include: {detail: true}
        })
    }

    static async countTechnologies(): Promise<number> {
        return await Database.client.technology.count()
    }

}