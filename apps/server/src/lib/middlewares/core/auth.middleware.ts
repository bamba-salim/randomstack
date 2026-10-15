import type {Request, Response, NextFunction} from 'express'
import {UserModel} from '#user'

export default class AuthMiddleware {
    /**
     * Session présente + rôle rechargé depuis la DB (évite un rôle figé 24h
     * après rétrogradation / promotion).
     */
    static async isAuthenticated(req: Request, res: Response, next: NextFunction): Promise<void> {
        const session = req.session as any
        if (!session || !session.userId) {
            res.status(401).json({error: "Authentification requise. Veuillez vous connecter."})
            return
        }

        try {
            const user = await UserModel.findAuthContext(session.userId)
            if (!user) {
                req.session.destroy(() => {
                    res.status(401).json({error: 'Session invalide. Reconnecte-toi.'})
                })
                return
            }

            session.userRole = user.role
            next()
        } catch {
            res.status(500).json({error: 'Impossible de vérifier la session.'})
        }
    }

    static permit(...allowedRoles: string[]) {
        return (req: Request, res: Response, next: NextFunction): void => {
            const session = req.session as any
            if (!session || !session.userRole || !allowedRoles.includes(session.userRole)) {
                res.status(403).json({error: "Accès refusé. Droits insuffisants."})
                return
            }
            next()
        }
    }
}
