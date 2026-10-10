import type {Table, FileType, UploadedFileListed} from '@randomstack/commons'

export default class FileMapper {
    static toSaveFileDTO(id: string, type: FileType, category: Table, ext: string, mimeType: string, size: number, altText: string | null) {
        return {
            file: {
                id: id,
                type: type.toUpperCase(),
                category: category.toUpperCase(),
                extension: ext,
                mimeType: mimeType,
                size: size,
                altText: altText,
            }
        }
    }

    static buildUploadedFileListed(file: {id: string}, url: string): UploadedFileListed {
        return {
            idFile: file.id,
            url
        }
    }
}