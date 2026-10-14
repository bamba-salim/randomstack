import type {Readable} from 'stream'

type S3Module = typeof import('@aws-sdk/client-s3')
type PresignerModule = typeof import('@aws-sdk/s3-request-presigner')

/**
 * Client S3-compatible (Railway Buckets / R2 / S3).
 * Si les variables S3_* manquent → mode local (disque) pour le dev.
 * Import SDK en lazy : le serveur démarre même si le package n'est pas encore installé.
 */
export default class ObjectStorage {
    private static client: import('@aws-sdk/client-s3').S3Client | null = null
    private static s3: S3Module | null = null
    private static presigner: PresignerModule | null = null

    static isEnabled(): boolean {
        return Boolean(
            process.env['S3_ENDPOINT']
            && process.env['S3_BUCKET']
            && process.env['S3_ACCESS_KEY_ID']
            && process.env['S3_SECRET_ACCESS_KEY']
        )
    }

    private static async loadSdk(): Promise<{s3: S3Module; presigner: PresignerModule}> {
        if (!this.s3 || !this.presigner) {
            this.s3 = await import('@aws-sdk/client-s3')
            this.presigner = await import('@aws-sdk/s3-request-presigner')
        }
        return {s3: this.s3, presigner: this.presigner}
    }

    private static async getClient() {
        const {s3} = await this.loadSdk()
        if (!this.client) {
            this.client = new s3.S3Client({
                endpoint: process.env['S3_ENDPOINT'],
                region: process.env['S3_REGION'] || 'auto',
                credentials: {
                    accessKeyId: process.env['S3_ACCESS_KEY_ID']!,
                    secretAccessKey: process.env['S3_SECRET_ACCESS_KEY']!
                },
                forcePathStyle: true
            })
        }
        return this.client
    }

    private static bucket(): string {
        return process.env['S3_BUCKET']!
    }

    static async putObject(
        key: string,
        body: Buffer,
        contentType: string
    ): Promise<void> {
        const {s3} = await this.loadSdk()
        const client = await this.getClient()
        await client.send(new s3.PutObjectCommand({
            Bucket: this.bucket(),
            Key: key,
            Body: body,
            ContentType: contentType
        }))
    }

    static async deleteObject(key: string): Promise<void> {
        const {s3} = await this.loadSdk()
        const client = await this.getClient()
        await client.send(new s3.DeleteObjectCommand({
            Bucket: this.bucket(),
            Key: key
        }))
    }

    /** Copie S3 puis suppression source (migration naming). */
    static async moveObject(fromKey: string, toKey: string): Promise<boolean> {
        try {
            const {s3} = await this.loadSdk()
            const client = await this.getClient()
            const bucket = this.bucket()
            await client.send(new s3.CopyObjectCommand({
                Bucket: bucket,
                CopySource: `${bucket}/${fromKey}`,
                Key: toKey
            }))
            await client.send(new s3.DeleteObjectCommand({
                Bucket: bucket,
                Key: fromKey
            }))
            return true
        } catch (error: any) {
            console.error('[ObjectStorage] Échec moveObject :', error.message || error)
            return false
        }
    }

    static async exists(key: string): Promise<boolean> {
        try {
            const {s3} = await this.loadSdk()
            const client = await this.getClient()
            await client.send(new s3.HeadObjectCommand({
                Bucket: this.bucket(),
                Key: key
            }))
            return true
        } catch {
            return false
        }
    }

    /** URL présignée GET (egress bucket gratuit côté Railway). */
    static async getSignedGetUrl(key: string, expiresInSeconds = 3600): Promise<string> {
        const {s3, presigner} = await this.loadSdk()
        const client = await this.getClient()
        const command = new s3.GetObjectCommand({
            Bucket: this.bucket(),
            Key: key
        })
        return presigner.getSignedUrl(client, command, {expiresIn: expiresInSeconds})
    }

    static async getObjectStream(key: string): Promise<{
        body: Readable
        contentType?: string
        contentLength?: number
    } | null> {
        try {
            const {s3} = await this.loadSdk()
            const client = await this.getClient()
            const result = await client.send(new s3.GetObjectCommand({
                Bucket: this.bucket(),
                Key: key
            }))
            if (!result.Body) return null
            return {
                body: result.Body as Readable,
                contentType: result.ContentType,
                contentLength: result.ContentLength
            }
        } catch {
            return null
        }
    }
}
