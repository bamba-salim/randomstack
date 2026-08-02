import type {Request, Response, NextFunction} from 'express'

export default class AuthMiddleware {
    // Vérifie si l'utilisateur est simplement connecté en session 🚀
    static isAuthenticated(req: Request, res: Response, next: NextFunction): void {
        const session = req.session as any
        if (!session || !session.userId) {
            res.status(401).json({error: "Authentification requise. Veuillez vous connecter."})
            return
        }
        next()
    }

    // Vérifie si l'utilisateur possède l'un des rôles autorisés 🚀
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