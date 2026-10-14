import type {Request, Response} from 'express'
import type {PublicPostListed} from '@randomstack/commons'
import {FILE_TYPE} from '@randomstack/commons'

import UserModel from './user.model'
import AuthMapper from './auth.mapper'
import {PasswordUtils} from '#utils'
import FavoriteModel from '../blog/favorite.model'
import BlogModel from '../blog/blog.model'
import BlogMapper from '../blog/blog.mapper'
import FileModel from '../file/file.model.js'

const AUTH_FAIL_MESSAGE = 'Identifiants incorrects.'

function regenerateSession(req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
            if (err) reject(err)
            else resolve()
        })
    })
}

async function openSession(req: Request, user: {id: string; role: string; passwordHash?: string}, plainPassword?: string) {
    await regenerateSession(req)
    const session = req.session as any
    session.userId = user.id
    session.userRole = user.role

    // Upgrade PBKDF2 si ancien hash (1000 itérations)
    if (plainPassword && user.passwordHash && PasswordUtils.needsRehash(user.passwordHash)) {
        await UserModel.updatePasswordHash(user.id, PasswordUtils.hash(plainPassword))
    }
}

export default class AuthController {

    private static async verifyCredentials(email: string, password: string) {
        if (!email || !password) {
            return {user: null, error: 'Email et mot de passe requis.'}
        }

        const user = await UserModel.findByEmail(email)

        // Message unique : ne révèle pas si l’email existe (énumération de comptes)
        if (!user || !PasswordUtils.verify(password, user.passwordHash)) {
            return {user: null, error: AUTH_FAIL_MESSAGE}
        }

        return {user, error: null}
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const {email, password} = req.body
            const {user, error} = await AuthController.verifyCredentials(email, password)

            if (error || !user) {
                res.status(401).json({error: error || AUTH_FAIL_MESSAGE})
                return
            }

            await openSession(req, user, password)
            res.json(AuthMapper.buildSessionUserResponse(user))
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
                // Même surface d’erreur pour limiter l’énumération
                res.status(409).json({error: 'Impossible de créer ce compte.'})
                return
            }

            const user = await UserModel.createUser(
                email,
                PasswordUtils.hash(password),
                displayName || undefined
            )

            await openSession(req, user)
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
            if (error || !user || !allowedAdminRoles.includes(user.role)) {
                res.status(401).json({error: AUTH_FAIL_MESSAGE})
                return
            }

            await openSession(req, user, password)
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

            // Aligne le rôle session sur la DB
            session.userRole = user.role

            res.json(AuthMapper.buildSessionUserResponse(user))
        } catch {
            res.status(500).json({error: 'Impossible de récupérer le profil.'})
        }
    }

    /** GET /fetch-profile/:id — profil public */
    static async fetchPublicProfile(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            if (!id) {
                res.status(400).json({error: 'Identifiant manquant.'})
                return
            }

            const profile = await UserModel.findPublicProfileById(id)
            if (!profile) {
                res.status(404).json({error: 'Profil introuvable.'})
                return
            }

            let favorites: PublicPostListed[] = []
            if (profile.favoritesPublic) {
                const rows = await FavoriteModel.fetchUserFavorites(id)
                favorites = BlogMapper.buildPublicPostListedList(rows.map(r => r.post))
            }

            const authored = await BlogModel.fetchPublishedPostsByAuthor(id, undefined, 24)
            const posts = BlogMapper.buildPublicPostListedList(authored)

            res.json(AuthMapper.buildPublicProfileListed(profile, favorites, posts))
        } catch (error: any) {
            console.error('[AuthController] Erreur fetchPublicProfile :', error.message || error)
            res.status(500).json({error: 'Impossible de charger le profil.'})
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

            if (!formBean.photoId) {
                res.status(400).json({error: 'Une photo de profil est obligatoire.'})
                return
            }

            const photo = await FileModel.getFileById(formBean.photoId)
            if (!photo || photo.type !== FILE_TYPE.IMAGE) {
                res.status(400).json({error: 'La photo de profil doit être une image valide.'})
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
                photoId: formBean.photoId,
                favoritesPublic: Boolean(formBean.favoritesPublic),
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
