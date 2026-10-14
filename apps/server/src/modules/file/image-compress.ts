import path from 'path'
import sharp from 'sharp'

export type CompressedImage = {
    buffer: Buffer
    mimeType: string
    extension: string
    originalName: string
    bytesBefore: number
    bytesAfter: number
    compressed: boolean
}

const SKIP_MIME = new Set([
    'image/svg+xml',
    'image/gif', // animation — ne pas aplatir
    'image/webp' // déjà compact ; on peut ré-encoder si gain
])

/**
 * Compresse les images raster en WebP haute qualité (visuellement quasi lossless).
 * SVG / GIF animés : inchangés. Si le résultat n'est pas plus petit → original gardé.
 */
export default class ImageCompress {
    static async maybeCompress(
        fileBuffer: Buffer,
        originalName: string,
        mimeType?: string
    ): Promise<CompressedImage> {
        const bytesBefore = fileBuffer.length
        const resolvedMime = mimeType || 'application/octet-stream'
        const ext = path.extname(originalName).toLowerCase() || '.bin'

        if (!resolvedMime.startsWith('image/')) {
            return {
                buffer: fileBuffer,
                mimeType: resolvedMime,
                extension: ext,
                originalName,
                bytesBefore,
                bytesAfter: bytesBefore,
                compressed: false
            }
        }

        // SVG : jamais stocké tel quel (XSS si servi inline)
        if (resolvedMime === 'image/svg+xml' || ext === '.svg') {
            throw new Error('Les fichiers SVG ne sont pas autorisés.')
        }

        if (resolvedMime === 'image/gif') {
            return {
                buffer: fileBuffer,
                mimeType: resolvedMime,
                extension: ext,
                originalName,
                bytesBefore,
                bytesAfter: bytesBefore,
                compressed: false
            }
        }

        try {
            const pipeline = sharp(fileBuffer, {failOn: 'none'}).rotate()

            // WebP déjà en entrée : ré-encode avec effort max uniquement si gain
            const webpBuffer = await pipeline
                .webp({
                    quality: 90,
                    alphaQuality: 90,
                    effort: 6,
                    smartSubsample: true
                })
                .toBuffer()

            if (webpBuffer.length >= bytesBefore) {
                return {
                    buffer: fileBuffer,
                    mimeType: resolvedMime,
                    extension: ext,
                    originalName,
                    bytesBefore,
                    bytesAfter: bytesBefore,
                    compressed: false
                }
            }

            const base = path.basename(originalName, path.extname(originalName)) || 'image'
            return {
                buffer: webpBuffer,
                mimeType: 'image/webp',
                extension: '.webp',
                originalName: `${base}.webp`,
                bytesBefore,
                bytesAfter: webpBuffer.length,
                compressed: true
            }
        } catch (error: any) {
            console.warn('[ImageCompress] Compression ignorée :', error.message || error)
            return {
                buffer: fileBuffer,
                mimeType: resolvedMime,
                extension: ext,
                originalName,
                bytesBefore,
                bytesAfter: bytesBefore,
                compressed: false
            }
        }
    }
}
