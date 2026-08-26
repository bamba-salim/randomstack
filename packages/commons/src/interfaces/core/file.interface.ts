import type {FileType, Table} from '../../constants'

export interface File {
    id: string
    type: FileType
    category: Table
    extension: string
    mimeType: string
    size: int
    altText?: string
    createdAt?: Date
}

export interface EditFile {
    file: Omit<File, 'createdAt'>
}