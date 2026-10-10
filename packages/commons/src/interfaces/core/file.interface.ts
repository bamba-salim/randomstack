import type {FileType, Table} from '../../constants'

export interface FileRecord {
    id: string
    type: FileType
    category: Table | string
    extension: string
    mimeType: string
    size: number
    altText: string | null
    createdAt?: string | Date
}

/** @deprecated — préférer FileRecord */
export type File = FileRecord
