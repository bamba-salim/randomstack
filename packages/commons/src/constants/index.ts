export const TABLE = {
    TECHNOLOGY: 'technology',
    POST: 'post',
    USER: 'user',
    Comment: 'comment'
}

export const FILE_TYPE = {
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    DOCUMENT: 'DOCUMENT',
    OTHER: 'OTHER'
}

export const TECHNOLOGY_CATEGORY = {
    FRONTEND: 'FRONTEND',
    BACKEND: 'BACKEND',
    DATABASE: 'DATABASE',
    MOBILE: 'MOBILE',
    DESKTOP: 'DESKTOP',
}

export const USER_ROLE = {
    USER: 'USER',
    MODERATOR: 'MODERATOR',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

export const POST_STATUS = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED',
    SCHEDULED: 'SCHEDULED',
    DELETED: 'DELETED'
}

export const BLOCK_TYPE = {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    CODE: 'CODE',
    DOUBLE_CONTENT: 'DOUBLE_CONTENT'
}

export type FileType = typeof FILE_TYPE[keyof typeof FILE_TYPE]
export type Category = typeof TECHNOLOGY_CATEGORY[keyof typeof TECHNOLOGY_CATEGORY]
export type Role = typeof USER_ROLE[keyof typeof USER_ROLE]
export type PostStatus = typeof POST_STATUS[keyof typeof POST_STATUS]
export type BlockType = typeof BLOCK_TYPE[keyof typeof BLOCK_TYPE]
export type Table = typeof TABLE[keyof typeof TABLE]