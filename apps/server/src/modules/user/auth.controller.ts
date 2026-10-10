import type {Request, Response} from 'express'

import UserModel from './user.model'
import AuthMapper from './auth.mapper'
import {PasswordUtils} from '#utils'

export default class AuthController {

    private static async verifyCredentials(email: string, password: string) {
        if (!email || !password) {
            return {user: null, error: 'Email et mot de passe requis.'}
        }

        const user = await UserModel.findByEmail(email)

        if (!user) {
            return {user: null, error: "Ce compte n'existe pas."}
        }

        const isPasswordValid = PasswordUtils.verify(password, user.passwordHash)

        if (!isPasswordValid) {
            return {user: null, error: 'Mot de passe incorrect.'}
        }

        return {user, error: null}
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const {email, password} = req.body
            const {user, error} = await AuthController.verifyCredentials(email, password)

            if (error) {
                res.status(401).json({error})
                return
            }

            const session = req.session as any
            session.userId = user!.id
            session.userRole = user!.role

            res.json(AuthMapper.buildSessionUserResponse(user!))
        } catch {
            res.status(500).json({error: "Erreur lors de l'authentification."})
        }
    }

    static async adminLogin(req: Request, res: Response): Promise<void> {
        try {
            const {email, password} = req.body
            const {user, error} = await AuthController.verifyCredentials(email, password)

            if (error) {
                res.status(401).json({error})
                return
            }

            const allowedAdminRoles = ['ADMIN', 'EDITOR', 'MODERATOR']

            if (!user || !allowedAdminRoles.includes(user.role)) {
                res.status(401).json({error: "Ce compte n'existe pas."})
                return
            }

            const session = req.session as any
            session.userId = user.id
            session.userRole = user.role

            res.json(AuthMapper.buildSessionUserResponse(user))
        } catch {
            res.status(500).json({error: "Erreur lors de l'authentification administrateur."})
        }
    }

    static async me(req: Request, res: Response): Promise<void> {
        try {
            const session = req.session as any
            const user = await UserModel.findById(session.userId)

            if (!user) {
                res.status(404).json({error: 'Utilisateur introuvable.'})
                return
            }

            res.json(AuthMapper.buildSessionUserResponse(user))
        } catch {
            res.status(500).json({error: 'Impossible de récupérer le profil.'})
        }
    }

    static async logout(req: Request, res: Response): Promise<void> {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).json({error: "Impossible de se déconnecter."})
                return
            }
            res.clearCookie('connect.sid')
            res.json(AuthMapper.buildSuccessAck())
        })
    }
}
