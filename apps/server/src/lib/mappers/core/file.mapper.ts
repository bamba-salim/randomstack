import type {FILE_TYPE, TABLE} from "@randomstack/commons";

export default class FileMapper {
    static toSaveFileDTO(id: string, type: FILE_TYPE, category: TABLE, ext: string, mimeType: string, size: number, altText: string | null){
        return {
            file: {
                id: targetId,
                type: FILE_TYPE.IMAGE,
                category: TABLE.POST,
                extension: ext,
                mimeType: mimeType,
                size: size,
                altText: altText | null,
            }
        }
    }
}