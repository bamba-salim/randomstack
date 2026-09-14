import {Database} from "#db";
import type {EditFile} from "@randomstack/commons";

export default class FileModel {

    static async getFileById(id: string){
        return await Database.client.file.findUnique({where: {id}})
    }

    static async createFile(payload: EditFile) {
        return await Database.client.file.create({
            data: payload.file
        })
    }

    static async deleteFile(id: string) {
        await Database.client.file.delete({where: {id}})
    }

}