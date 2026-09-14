import type {Table, FileType} from "@randomstack/commons";

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
}