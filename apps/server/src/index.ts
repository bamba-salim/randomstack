import express from 'express'
import cors from 'cors'
import { DatabaseConfig } from '#config'
import { SessionMiddleware } from '#middlewares'
import { SeedAction } from '#action-support' // <-- 1. IMPORTATION ICI
import { StackRoute } from '#routes'

const app = express()

// Activation de CORS avec partage de credentials pour la session
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(express.json())
app.use(SessionMiddleware.config)

// Enregistrement des points d'API
app.use('/api', StackRoute.routes)

const PORT = process.env['PORT'] || 4000

// Validation et démarrage de l'infrastructure
DatabaseConfig.checkConnection().then(async (connected) => {
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