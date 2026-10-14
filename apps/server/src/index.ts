import './load-env.js'
import express from 'express'
import cors from 'cors'
import path from 'path'

import {Database} from '#db'
import {SessionMiddleware} from '#middlewares'
import {CronJobs} from '#action-support'
import {SeedAction} from '#stack'
import {ObjectStorage} from '#file'

import WebService from './modules/web-service'
import Api from './modules/api'
import Auth, {AdminAuth} from './modules/auth'

const app = express()

/**
 * Origines CORS (env) + localhost dev.
 * `*` ou CORS_ALLOW_ALL=true → autorise toute Origin (Bruno / debug).
 * Avec credentials, on reflète l'Origin (jamais le header littéral `*`).
 */
function resolveCorsOrigins(): {allowAll: boolean; origins: string[]} {
    const fromEnv = [
        process.env['CLIENT_ORIGIN'],
        process.env['EXTRANET_ORIGIN'],
        ...(process.env['CORS_ORIGINS']?.split(',') ?? [])
    ]
        .map(o => o?.trim())
        .filter((o): o is string => Boolean(o))

    const origins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        ...fromEnv
    ]

    const allowAll =
        process.env['CORS_ALLOW_ALL'] === 'true'
        || origins.includes('*')
        || fromEnv.includes('*')

    return {
        allowAll,
        origins: origins.filter(o => o !== '*')
    }
}

const {allowAll: CORS_ALLOW_ALL, origins: ALLOWED_ORIGINS} = resolveCorsOrigins()

app.use(cors({
    origin: (origin, callback) => {
        // Pas d'Origin (Bruno, curl, same-origin) → OK
        if (!origin || CORS_ALLOW_ALL || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true)
            return
        }
        callback(new Error('Accès refusé par la politique CORS.'))
    },
    credentials: true
}))

app.use(express.json())

// Session unique client + extranet (`rs.sid`) — 2 navigateurs si comptes distincts
app.use(SessionMiddleware.config)
app.use('/ws', Api.routes)
app.use('/auth/admin', AdminAuth.routes)
app.use('/public', express.static(path.resolve(process.cwd(), 'public')))
app.use('/', WebService.routes)
app.use('/auth', Auth.routes)

const PORT = process.env['PORT'] || 4000

Database.checkConnection().then(async (connected) => {
    if (connected) {
        await SeedAction.execute()

        CronJobs.boot()

        app.listen(PORT, () => {
            const storageMode = ObjectStorage.isEnabled() ? 'Railway S3 bucket' : 'local disk (public/uploads)'
            console.log(`[Server] Prêt sur le port ${PORT} — fichiers: ${storageMode}`)
            console.log(`[Server] CORS: ${CORS_ALLOW_ALL ? 'allow-all (*)' : ALLOWED_ORIGINS.join(', ')}`)
        })
    } else {
        console.error("[Server] Impossible d'établir une connexion à PostgreSQL.")
        process.exit(1)
    }
})
