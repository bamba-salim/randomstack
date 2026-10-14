import crypto from 'crypto'

/** Itérations PBKDF2 actuelles (OWASP-aligned order of magnitude). */
const PBKDF2_ITERATIONS = 120_000
/** Ancien format `salt:hash` (avant migration). */
const LEGACY_ITERATIONS = 1000

export default class PasswordUtils {

    static hash(password: string, iterations = PBKDF2_ITERATIONS): string {
        const salt = crypto.randomBytes(16).toString('hex')
        const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex')
        // Format v2 : iterations$salt$hash
        return `${iterations}$${salt}$${hash}`
    }

    static verify(password: string, storedHash: string): boolean {
        const parsed = PasswordUtils.parse(storedHash)
        if (!parsed) return false
        const hash = crypto.pbkdf2Sync(password, parsed.salt, parsed.iterations, 64, 'sha512').toString('hex')
        const a = Buffer.from(hash, 'hex')
        const b = Buffer.from(parsed.hash, 'hex')
        if (a.length !== b.length) return false
        return crypto.timingSafeEqual(a, b)
    }

    /** True si le hash doit être réécrit au format / itérations actuelles. */
    static needsRehash(storedHash: string): boolean {
        const parsed = PasswordUtils.parse(storedHash)
        return !parsed || parsed.iterations !== PBKDF2_ITERATIONS
    }

    private static parse(storedHash: string): {iterations: number; salt: string; hash: string} | null {
        if (!storedHash) return null

        // v2 : iterations$salt$hash
        if (storedHash.includes('$')) {
            const [iterStr, salt, hash] = storedHash.split('$')
            const iterations = Number(iterStr)
            if (!iterations || !salt || !hash) return null
            return {iterations, salt, hash}
        }

        // legacy : salt:hash (1000 itérations)
        const [salt, hash] = storedHash.split(':')
        if (!salt || !hash) return null
        return {iterations: LEGACY_ITERATIONS, salt, hash}
    }
}
