import type {Request, Response} from 'express'
import type {CreateUserFormBean, Role, UpdateUserRoleFormBean} from '@randomstack/commons'
import {PasswordUtils} from '#utils'
import UserModel from './user.model'
import UserMapper from './user.mapper'

export default class AdminUserController {

    static async fetchEditorialAuthors(_req: Request, res: Response): Promise<void> {
        try {
            const users = await UserModel.findEditorialAuthors()
            res.json(UserMapper.buildEditorialAuthorLiteList(users))
        } catch (error: any) {
            console.error('[AdminUserController] Erreur fetchEditorialAuthors :', error.message || error)
            res.status(500).json({error: 'Impossible de charger les auteurs.'})
        }
    }

    static async fetchUsers(req: Request, res: Response): Promise<void> {
        try {
            const actorRole = req.session?.userRole as Role | undefined
            // EDITOR : uniquement les AUTHOR (pour voir leurs articles)
            const roleFilter = actorRole === 'EDITOR' ? ('AUTHOR' as Role) : undefined
            const users = await UserModel.fetchAllAdminUsers(roleFilter)
            res.json(UserMapper.buildAdminUserListedList(users))
        } catch (error: any) {
            console.error('[AdminUserController] Erreur fetchUsers :', error.message || error)
            res.status(500).json({error: 'Impossible de charger les utilisateurs.'})
        }
    }

    static async fetchUserById(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            const actorRole = req.session?.userRole as Role | undefined
            const user = await UserModel.fetchAdminUserById(id)
            if (!user) {
                res.status(404).json({error: 'Utilisateur introuvable.'})
                return
            }
            if (actorRole === 'EDITOR' && user.role !== 'AUTHOR') {
                res.status(403).json({error: 'Un éditeur ne peut consulter que les auteurs.'})
                return
            }
            res.json(UserMapper.buildAdminUserDetail(user))
        } catch (error: any) {
            console.error('[AdminUserController] Erreur fetchUserById :', error.message || error)
            res.status(500).json({error: "Impossible de charger l'utilisateur."})
        }
    }

    /**
     * Création d'un utilisateur — ADMIN uniquement
     */
    static async createUser(req: Request, res: Response): Promise<void> {
        try {
            const actorRole = req.session?.userRole as Role | undefined
            if (actorRole !== 'ADMIN') {
                res.status(403).json({error: 'Seul un administrateur peut créer un utilisateur.'})
                return
            }

            // Body déjà validé par validateCreateUser
            const {email, password, displayName, role} = req.body as CreateUserFormBean

            const existing = await UserModel.findByEmail(email)
            if (existing) {
                res.status(409).json({error: 'Impossible de créer ce compte.'})
                return
            }

            const created = await UserModel.createWithProfile(
                email,
                PasswordUtils.hash(password),
                role,
                displayName
            )
            const listed = await UserModel.fetchAdminUserListedById(created.id)
            if (!listed) {
                res.status(500).json({error: 'Utilisateur créé mais impossible de le recharger.'})
                return
            }

            res.status(201).json(UserMapper.buildCreateUserResponse(listed))
        } catch (error: any) {
            console.error('[AdminUserController] Erreur createUser :', error.message || error)
            res.status(500).json({error: 'Impossible de créer ce compte.'})
        }
    }

    /**
     * Changement de rôle
     * - ADMIN : tous les rôles (sauf retrait du dernier ADMIN)
     * - MODERATOR : USER ↔ AUTHOR uniquement
     */
    static async updateUserRole(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params
            const {role} = req.body as UpdateUserRoleFormBean
            const actorRole = req.session?.userRole as Role | undefined
            const moderatorManagedRoles: Role[] = ['USER', 'AUTHOR']

            if (!id) {
                res.status(400).json({error: 'Identifiant utilisateur manquant.'})
                return
            }

            const existing = await UserModel.fetchAdminUserById(id)
            if (!existing) {
                res.status(404).json({error: 'Utilisateur introuvable.'})
                return
            }

            if (actorRole === 'MODERATOR') {
                const canManage =
                    moderatorManagedRoles.includes(existing.role) &&
                    moderatorManagedRoles.includes(role)
                if (!canManage) {
                    res.status(403).json({
                        error: 'Un modérateur peut uniquement basculer entre USER et AUTHOR.'
                    })
                    return
                }
            } else if (actorRole !== 'ADMIN') {
                res.status(403).json({error: 'Accès refusé.'})
                return
            }

            if (existing.role === 'ADMIN' && role !== 'ADMIN') {
                const adminCount = await UserModel.countAdmins()
                if (adminCount <= 1) {
                    res.status(400).json({error: 'Impossible de retirer le dernier administrateur.'})
                    return
                }
            }

            const updated = await UserModel.updateRole(id, role)
            res.json(UserMapper.buildUpdateUserRoleResponse(updated))
        } catch (error: any) {
            console.error('[AdminUserController] Erreur updateUserRole :', error.message || error)
            res.status(500).json({error: 'Impossible de mettre à jour le rôle.'})
        }
    }
}
