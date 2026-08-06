import {Database} from '#db'
import type {Role} from '@randomstack/commons'


export default class UserModel {

    static async findByEmail(email: string) {
        return await Database.client.user.findUnique({
            where: {email}
        })
    }

    static async findById(id: string) {
        return await Database.client.user.findUnique({
            where: {id},
            select: {id: true, email: true, role: true}
        })
    }

    static async createAdmin(email: string, passwordHash: string) {
        return await Database.client.user.create({
            data: {
                email,
                passwordHash,
                role: 'ADMIN' as Role
            }
        })
    }

    static async count(): Promise<number> {
        return await Database.client.user.count()
    }

}