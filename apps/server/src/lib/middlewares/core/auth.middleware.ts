import type {Request, Response, NextFunction} from 'express'
import {UserModel} from '#user'

export default class AuthMiddleware {
    /**
     * Session présente + rôle rechargé depuis la DB (évite un rôle figé 24h
     * après rétrogradation / promotion).
     */
    static async isAuthenticated(req: Request, res: Response, next: NextFunction): Promise<void> {
        if (!req.session?.userId) {
            res.status(401).json({error: "Authentification requise. Veuillez vous connecter."})
            return
        }

        try {
            const user = await UserModel.findAuthContext(req.session.userId)
            if (!user) {
                req.session.destroy(() => {
                    res.status(401).json({error: 'Session invalide. Reconnecte-toi.'})
                })
                return
            }

            req.session.userRole = user.role
            next()
        } catch {
            res.status(500).json({error: 'Impossible de vérifier la session.'})
        }
    }

    static permit(...allowedRoles: string[]) {
        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.session?.userRole || !allowedRoles.includes(req.session.userRole)) {
                res.status(403).json({error: "Accès refusé. Droits insuffisants."})
                return
            }
            next()
        }
    }
}
