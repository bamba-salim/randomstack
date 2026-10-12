import {config} from 'dotenv'
import path from 'path'
import {fileURLToPath} from 'url'
import {defineConfig} from 'prisma/config'

const here = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(here, '../..')

/**
 * Ne jamais écraser une DATABASE_URL déjà fournie (Docker / Railway).
 * Hors container : .env.local peut compléter.
 */
const hasDbUrl = Boolean(process.env['DATABASE_URL'])

config({path: path.join(monorepoRoot, '.env')})
config({path: path.join(here, '.env')})
if (!hasDbUrl && process.env['RUNNING_IN_DOCKER'] !== 'true') {
    config({path: path.join(here, '.env.local'), override: true})
}

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: process.env['DATABASE_URL']!
    }
})
