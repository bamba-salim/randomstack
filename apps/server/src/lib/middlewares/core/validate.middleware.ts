import type {Request, Response, NextFunction, RequestHandler} from 'express'
import type {ValidationResult} from '@randomstack/commons'

type ValidatorFn<T> = (raw: unknown) => ValidationResult<T>
type Source = 'body' | 'params' | 'query'

declare global {
    namespace Express {
        interface Request {
            /** Payload validé / normalisé par ValidateMiddleware */
            validated?: unknown
        }
    }
}

function pickSource(req: Request, source: Source): unknown {
    if (source === 'params') return req.params
    if (source === 'query') return req.query
    return req.body
}

/**
 * Middleware de validation.
 * - champ(s) invalides → 400 `{ error, field?, errors? }`
 * - stocke le data normalisé dans `req.validated` et remplace `req.body` si source=body
 */
export default class ValidateMiddleware {
    static body<T>(validator: ValidatorFn<T>): RequestHandler {
        return ValidateMiddleware.run(validator, 'body')
    }

    static params<T>(validator: ValidatorFn<T>): RequestHandler {
        return ValidateMiddleware.run(validator, 'params')
    }

    private static run<T>(validator: ValidatorFn<T>, source: Source): RequestHandler {
        return (req: Request, res: Response, next: NextFunction) => {
            const result = validator(pickSource(req, source))

            if (!result.ok) {
                res.status(400).json({
                    error: result.error,
                    ...(result.field ? {field: result.field} : {}),
                    ...(result.errors ? {errors: result.errors} : {})
                })
                return
            }

            req.validated = result.data
            if (source === 'body') {
                req.body = result.data
            }
            next()
        }
    }
}
