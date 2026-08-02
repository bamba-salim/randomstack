import type { Request, Response } from 'express'
import { UserModel } from '#models'
import {PasswordUtils} from '#utils' // Ajusté selon votre arborescence 🚀

export default class AuthController {

    // Méthode d'aide privée pour valider les identifiants sans dupliquer de code 🚀
    private static async verifyCredentials(email: string, password: string) {
        if (!email || !password) {
            return { user: null, error: 'Email et mot de passe requis.' }
        }


        const user = await UserModel.findByEmail(email)

        if (!user) {
            return { user: null, error: "Ce compte n'existe pas." } // Existence du compte 🚀
        }

        const isPasswordValid = PasswordUtils.verify(password, user.passwordHash)

        console.log(isPasswordValid)
        if (!isPasswordValid) {
            return { user: null, error: 'Mot de passe incorrect.' }
        }

        return { user, error: null }
    }

    // 1. LOGIN PUBLIC (Connexion classique)
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body
            const { user, error } = await AuthController.verifyCredentials(email, password)

            if (error) {
                res.status(401).json({ error })
                return
            }

            const session = req.session as any
            session.userId = user!.id
            session.userRole = user!.role

            res.json({
                user: { id: user!.id, email: user!.email, role: user!.role }
            })
        } catch {
            res.status(500).json({ error: "Erreur lors de l'authentification." })
        }
    }

    // 2. LOGIN ADMINISTRATEUR (Pour l'Extranet) 🔒
    static async adminLogin(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body


            const { user, error } = await AuthController.verifyCredentials(email, password)


            // Si la vérification de base (email/mot de passe) échoue, on renvoie l'erreur
            if (error) {
                res.status(401).json({ error })
                return
            }

            // Rôles habilités pour l'extranet
            const allowedAdminRoles = ['ADMIN', 'EDITOR', 'MODERATOR']

            // SÉCURITÉ & UX : Si l'utilisateur est un simple USER public,
            // on renvoie le même message d'erreur "Ce compte n'existe pas" (masquage d'autorisation) 🚀
            if (!user || !allowedAdminRoles.includes(user.role)) {
                res.status(401).json({ error: "Ce compte n'existe pas." })
                return
            }

            const session = req.session as any
            session.userId = user.id
            session.userRole = user.role

            res.json({
                user: { id: user.id, email: user.email, role: user.role }
            })
        } catch {
            res.status(500).json({ error: "Erreur lors de l'authentification administrateur." })
        }
    }

    static async me(req: Request, res: Response): Promise<void> {
        try {
            const session = req.session as any
            const user = await UserModel.findById(session.userId)

            if (!user) {
                res.status(404).json({ error: 'Utilisateur introuvable.' })
                return
            }

            res.json({ user })
        } catch {
            res.status(500).json({ error: 'Impossible de récupérer le profil.' })
        }
    }

    static async logout(req: Request, res: Response): Promise<void> {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).json({ error: "Impossible de se déconnecter." })
                return
            }
            res.clearCookie('connect.sid')
            res.json({ success: true })
        })
    }
}