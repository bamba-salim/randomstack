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

    static async create(data: SaveTechnologyDTO) {
        return await Database.client.technology.create({
            data
        })
    }

    static async insertTechnology(tech: RawExcelTech, category: string) {
        await Database.client.technology.upsert({
            where: {name: tech.Framework},
            update: {},
            create: {
                name: tech.Framework,
                language: tech.Langage,
                logo: null,
                usage: tech.Utilisation,
                description: tech.Description,
                category: category
            }
        })
    }

    static async update(data: SaveTechnologyDTO) {
        const {id: _, ...updateData} = data
        return await Database.client.technology.update({
            where: {id: data.id},
            data: updateData
        })
    }


    static async count(): Promise<number> {
        return await Database.client.technology.count()
    }

}