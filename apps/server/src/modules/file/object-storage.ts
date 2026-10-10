import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand
} from '@aws-sdk/client-s3'
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import type {Readable} from 'stream'

/**
 * Client S3-compatible (Railway Buckets / R2 / S3).
 * Si les variables S3_* manquent → mode local (disque) pour le dev.
 */
export default class ObjectStorage {
    private static client: S3Client | null = null

    static isEnabled(): boolean {
        return Boolean(
            process.env['S3_ENDPOINT']
            && process.env['S3_BUCKET']
            && process.env['S3_ACCESS_KEY_ID']
            && process.env['S3_SECRET_ACCESS_KEY']
        )
    }

    private static getClient(): S3Client {
        if (!this.client) {
            this.client = new S3Client({
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
        await this.getClient().send(new PutObjectCommand({
            Bucket: this.bucket(),
            Key: key,
            Body: body,
            ContentType: contentType
        }))
    }

    static async deleteObject(key: string): Promise<void> {
        await this.getClient().send(new DeleteObjectCommand({
            Bucket: this.bucket(),
            Key: key
        }))
    }

    static async exists(key: string): Promise<boolean> {
        try {
            await this.getClient().send(new HeadObjectCommand({
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
        const command = new GetObjectCommand({
            Bucket: this.bucket(),
            Key: key
        })
        return getSignedUrl(this.getClient(), command, {expiresIn: expiresInSeconds})
    }

    static async getObjectStream(key: string): Promise<{
        body: Readable
        contentType?: string
        contentLength?: number
    } | null> {
        try {
            const result = await this.getClient().send(new GetObjectCommand({
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
