import 'dotenv/config'
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
import Auth from './modules/auth'

const app = express()

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    '*'
]

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Accès refusé par la politique CORS.'))
        }
    },
    credentials: true
}))

app.use(express.json())
app.use(SessionMiddleware.config)

app.use('/public', express.static(path.resolve(process.cwd(), 'public')))

// Même pattern pour les 3 surfaces
app.use('/', WebService.routes)   // 🌐 Client (public)
app.use('/ws', Api.routes)        // 🛠️ Extranet (admin)
app.use('/auth', Auth.routes)     // 🔐 Auth

const PORT = process.env['PORT'] || 4000

Database.checkConnection().then(async (connected) => {
    if (connected) {
        await SeedAction.execute()

        CronJobs.boot()

        app.listen(PORT, () => {
            const storageMode = ObjectStorage.isEnabled() ? 'Railway S3 bucket' : 'local disk (public/uploads)'
            console.log(`[Server] Prêt sur le port ${PORT} — fichiers: ${storageMode}`)
        })
    } else {
        console.error("[Server] Impossible d'établir une connexion à PostgreSQL.")
        process.exit(1)
    }
})
