import {Database} from '#db'
import type {Technology} from '@prisma/client'

import type {RawExcelTech, SaveTechnologyDTO} from '#interfaces'


export default class TechnologyModel {

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

    static async findAll() {
        return await Database.client.technology.findMany()
    }

    static async count(): Promise<number> {
        return await Database.client.technology.count()
    }

    // Récupérer une seule technologie 🚀
    static async findById(id: string) {
        return await Database.client.technology.findUnique({
            where: {id}
        })
    }

    // Modifier une technologie 🚀
    static async update(data: SaveTechnologyDTO) {
        const {id: _, ...updateData} = data
        return await Database.client.technology.update({
            where: {id: data.id},
            data: updateData
        })
    }

    static async create(data: SaveTechnologyDTO) {
        return await Database.client.technology.create({
            data
        })
    }
}