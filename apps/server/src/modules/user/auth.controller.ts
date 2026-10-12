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

    /**
     * Inscription publique — rôle USER + profil, session ouverte
     * Cible : POST /auth/register
     */
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const email = String(req.body?.email || '').trim().toLowerCase()
            const password = String(req.body?.password || '')
            const displayName = String(req.body?.displayName || '').trim()

            if (!email || !password) {
                res.status(400).json({error: 'Email et mot de passe requis.'})
                return
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                res.status(400).json({error: 'Email invalide.'})
                return
            }

            if (password.length < 8) {
                res.status(400).json({error: 'Le mot de passe doit contenir au moins 8 caractères.'})
                return
            }

            const existing = await UserModel.findByEmail(email)
            if (existing) {
                res.status(409).json({error: 'Un compte existe déjà avec cet email.'})
                return
            }

            const user = await UserModel.createUser(
                email,
                PasswordUtils.hash(password),
                displayName || undefined
            )

            const session = req.session as any
            session.userId = user.id
            session.userRole = user.role

            res.status(201).json(AuthMapper.buildSessionUserResponse(user))
        } catch (error: any) {
            console.error('[AuthController] Erreur register :', error.message || error)
            res.status(500).json({error: "Impossible de créer le compte."})
        }
    }

    static async adminLogin(req: Request, res: Response): Promise<void> {
        try {
            const {email, password} = req.body
            const {user, error} = await AuthController.verifyCredentials(email, password)

            const allowedAdminRoles = ['ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR']
            // Message unique : pas de fuite (mauvais mdp / rôle USER / email inconnu)
            if (error || !user || !allowedAdminRoles.includes(user.role)) {
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

    /**
     * Mise à jour du profil de l'utilisateur connecté
     * Cible : POST /auth/update-profile
     */
    static async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const session = req.session as any
            const userId = session?.userId as string | undefined
            if (!userId) {
                res.status(401).json({error: 'Authentification requise.'})
                return
            }

            const formBean = AuthMapper.normalizeEditProfileFormBean(req.body || {})

            if (!formBean.displayName) {
                res.status(400).json({error: 'Le nom d’affichage est requis.'})
                return
            }

            if (formBean.displayName.length > 80) {
                res.status(400).json({error: 'Le nom d’affichage est trop long (80 max).'})
                return
            }

            for (const link of formBean.links) {
                try {
                    const parsed = new URL(link.url)
                    if (!['http:', 'https:'].includes(parsed.protocol)) {
                        res.status(400).json({error: `URL invalide : ${link.label}`})
                        return
                    }
                } catch {
                    res.status(400).json({error: `URL invalide : ${link.label}`})
                    return
                }
            }

            const user = await UserModel.updateOwnProfile(userId, {
                displayName: formBean.displayName,
                bio: formBean.bio ?? null,
                photoId: formBean.photoId ?? null,
                links: formBean.links.map((l, i) => ({
                    label: l.label,
                    url: l.url,
                    sortOrder: l.sortOrder ?? i
                }))
            })

            if (!user) {
                res.status(404).json({error: 'Utilisateur introuvable.'})
                return
            }

            res.json(AuthMapper.buildSessionUserResponse(user))
        } catch (error: any) {
            console.error('[AuthController] Erreur updateProfile :', error.message || error)
            res.status(500).json({error: 'Impossible de mettre à jour le profil.'})
        }
    }

    /** Logout pour un cookie de session donné (client vs admin). */
    static logout(cookieName: string) {
        return (req: Request, res: Response): void => {
            req.session.destroy((err) => {
                if (err) {
                    res.status(500).json({error: "Impossible de se déconnecter."})
                    return
                }
                res.clearCookie(cookieName, {path: '/'})
                res.json(AuthMapper.buildSuccessAck())
            })
        }
    }
}
