import {BaseModel} from "#abstracts";
import type {EditFile} from "@randomstack/commons";

export default class FileModel extends BaseModel {

    static async getFileById(id: string) {
        return await this.db.file.findUnique({where: {id}})
    }

    static async createFile(payload: EditFile) {
        return await this.db.file.create({
            data: payload.file
        })
    }

    static async deleteFile(id: string) {
        await this.db.file.delete({where: {id}})
    }

}