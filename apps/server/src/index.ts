import express from 'express'
import cors from 'cors'

import {Database} from '#db'
import AppRouter from '#routes'
import {SessionMiddleware} from '#middlewares'
import {SeedAction} from '#action-support'

const app = express()

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
]

// Activation de CORS avec partage de credentials pour la session
app.use(cors({
    origin: (origin, callback) => {
        // On autorise les requêtes sans origine (comme Postman ou curl) ou celles dans notre liste blanche
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

// Enregistrement des points d'API
app.use('/api', AppRouter.routes)


const PORT = process.env['PORT'] || 4000

// Validation et démarrage de l'infrastructure
Database.checkConnection().then(async (connected) => {
    if (connected) {
        await SeedAction.execute()

        app.listen(PORT, () => {
            console.log(`[Server] Prêt et opérationnel sur le port ${PORT}`)
        })
    } else {
        console.error("[Server] Impossible d'établir une connexion à PostgreSQL.")
        process.exit(1)
    }
})