import type {Request, Response} from 'express'
import type {LoginFormBean, RegisterFormBean, EditProfileFormBean, PublicPostListed} from '@randomstack/commons'
import {FILE_TYPE, AuthValidatorMessages} from '@randomstack/commons'

import UserModel from './user.model'
import AuthMapper from './auth.mapper'
import {PasswordUtils} from '#utils'
import {FavoriteModel, BlogModel, BlogMapper} from '#blog'
import {FileModel} from '#file'

const AUTH_FAIL_MESSAGE = AuthValidatorMessages.AUTH_FAIL
const REGISTER_FAIL_MESSAGE = AuthValidatorMessages.REGISTER_FAIL

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
    req.session.userId = user.id
    req.session.userRole = user.role

    // Upgrade PBKDF2 si ancien hash (1000 itérations)
    if (plainPassword && user.passwordHash && PasswordUtils.needsRehash(user.passwordHash)) {
        await UserModel.updatePasswordHash(user.id, PasswordUtils.hash(plainPassword))
    }
}

export default class AuthController {

    private static async verifyCredentials(email: string, password: string) {
        const user = await UserModel.findByEmail(email)

        // Message unique : ne révèle pas si l’email existe (énumération de comptes)
        if (!user || !PasswordUtils.verify(password, user.passwordHash)) {
            return {user: null, error: AUTH_FAIL_MESSAGE}
        }

        return {user, error: null}
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const {email, password} = req.body as LoginFormBean
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
     * Body déjà validé par ValidateMiddleware + validateRegister.
     */
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const {email, password, displayName} = req.body as RegisterFormBean

            const existing = await UserModel.findByEmail(email)
            if (existing) {
                res.status(409).json({error: REGISTER_FAIL_MESSAGE})
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
            res.status(500).json({error: REGISTER_FAIL_MESSAGE})
        }
    }

    static async adminLogin(req: Request, res: Response): Promise<void> {
        try {
            const {email, password} = req.body as LoginFormBean
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
            const userId = req.session.userId
            if (!userId) {
                res.status(401).json({error: 'Authentification requise.'})
                return
            }

            const user = await UserModel.findById(userId)

            if (!user) {
                res.status(404).json({error: 'Utilisateur introuvable.'})
                return
            }

            // Aligne le rôle session sur la DB
            req.session.userRole = user.role

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
     * Body déjà validé par validateEditProfile.
     */
    static async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.session.userId
            if (!userId) {
                res.status(401).json({error: 'Authentification requise.'})
                return
            }

            const formBean = req.body as EditProfileFormBean

            const photo = await FileModel.getFileById(formBean.photoId!)
            if (!photo || photo.type !== FILE_TYPE.IMAGE) {
                res.status(400).json({
                    error: 'La photo de profil doit être une image valide.',
                    field: 'photoId'
                })
                return
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
