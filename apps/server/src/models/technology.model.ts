import { DbClient } from '#db'

export default class TechnologyModel {
    static async findAll() {
        return await DbClient.client.technology.findMany()
    }
}