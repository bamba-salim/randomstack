import {BaseModel} from '#abstracts'
import type {Role} from '@randomstack/commons'


export default class UserModel extends BaseModel{

    static async findByEmail(email: string) {
        return await this.db.user.findUnique({
            where: {email}
        })
    }

    static async findById(id: string) {
        return await this.db.user.findUnique({
            where: {id},
            select: {id: true, email: true, role: true}
        })
    }

    static async createAdmin(email: string, passwordHash: string) {
        return await this.db.user.create({
            data: {
                email,
                passwordHash,
                role: 'ADMIN' as Role
            }
        })
    }

    static async count(): Promise<number> {
        return await this.db.user.count()
    }

}