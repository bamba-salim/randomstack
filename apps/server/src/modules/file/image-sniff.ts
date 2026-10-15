import {fileTypeFromBuffer} from 'file-type'
import sharp from 'sharp'

/** MIME réellement détectés via magic bytes (pas le header client). */
const ALLOWED_IMAGE_MIMES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
])

const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
}

export type SniffedImage = {
    mimeType: string
    extension: string
}

/**
 * Valide le contenu binaire d’une image :
 * 1) magic bytes (`file-type`)
 * 2) décodage raster via sharp (sauf GIF animé conservé tel quel)
 */
export default class ImageSniff {
    static async assertSafeImage(buffer: Buffer): Promise<SniffedImage> {
        if (!buffer?.length) {
            throw new Error('Fichier vide.')
        }

        const detected = await fileTypeFromBuffer(buffer)
        if (!detected || !ALLOWED_IMAGE_MIMES.has(detected.mime)) {
            throw new Error('Contenu non reconnu comme image JPG/PNG/WebP/GIF.')
        }

        // SVG / HTML déguisés : file-type peut renvoyer autre chose ; double filet
        if (detected.mime === 'image/svg+xml' || detected.ext === 'svg') {
            throw new Error('Les fichiers SVG ne sont pas autorisés.')
        }

        // GIF : magic bytes suffisent (sharp aplatirait l’animation)
        if (detected.mime !== 'image/gif') {
            try {
                await sharp(buffer, {failOn: 'error'}).metadata()
            } catch {
                throw new Error('Image corrompue ou illisible.')
            }
        }

        return {
            mimeType: detected.mime,
            extension: MIME_TO_EXT[detected.mime] || `.${detected.ext}`
        }
    }
}
