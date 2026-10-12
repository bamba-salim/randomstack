import {config} from 'dotenv'
import path from 'path'
import {fileURLToPath} from 'url'

const here = path.dirname(fileURLToPath(import.meta.url))
const serverRoot = path.resolve(here, '..')
const monorepoRoot = path.resolve(serverRoot, '../..')

/**
 * Docker / Railway injectent déjà les vars → on ne les écrase pas.
 * Hors Docker : .env.local (localhost:5435, S3…) complète / override.
 */
const injected = Boolean(process.env['DATABASE_URL']) || process.env['RUNNING_IN_DOCKER'] === 'true'

config({path: path.join(monorepoRoot, '.env')})
config({path: path.join(serverRoot, '.env')})
if (!injected) {
    config({path: path.join(serverRoot, '.env.local'), override: true})
}
