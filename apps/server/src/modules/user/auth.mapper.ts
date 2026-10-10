import type {SessionUserLite, SessionUserResponse, SuccessAck} from '@randomstack/commons'

export default class AuthMapper {

    static buildSessionUserLite(user: {id: string; email: string; role: SessionUserLite['role']}): SessionUserLite {
        return {
            id: user.id,
            email: user.email,
            role: user.role
        }
    }

    static buildSessionUserResponse(user: {id: string; email: string; role: SessionUserLite['role']}): SessionUserResponse {
        return {
            user: this.buildSessionUserLite(user)
        }
    }

    static buildSuccessAck(): SuccessAck {
        return {success: true}
    }
}
