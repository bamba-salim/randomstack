import {Database} from '#db'
import type {Category, SaveTechnologyInput, RawExcelTech} from '@randomstack/commons'


export default class TechnologyModel {

    static async findAll() {
        return await Database.client.technology.findMany()
    }

    static async findById(id: string) {
        return await Database.client.technology.findUnique({
            where: {id}
        })
    }

    static async create(data: SaveTechnologyInput) {
        return await Database.client.technology.create({
            data
        })
    }

    static async update(data: SaveTechnologyInput) {
        const {id: _, ...updateData} = data
        return await Database.client.technology.update({
            where: {id: data.id},
            data: updateData
        })
    }


    static async count(): Promise<number> {
        return await Database.client.technology.count()
    }

    static async insertTechnology(tech: RawExcelTech, category: Category[]) {
        await Database.client.technology.upsert({
            where: {name: tech.Framework},
            update: {},
            create: {
                name: tech.Framework,
                language: tech.Langage,
                logo: null,
                usage: tech.Utilisation,
                description: tech.Description,
                categories: category as any
            }
        })
    }

}