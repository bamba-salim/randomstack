import ApiClient, {ApiError} from './api.client'
export {ApiError}
import type {
    AdminTechnologyListed,
    AdminPostListed,
    AdminUserListed,
    AdminUserDetail,
    CreateUserFormBean,
    CreateUserResponse,
    EditTechnologyFormBean,
    EditPostFormBean,
    EditorialAuthorLite,
    FileType,
    Role,
    Table,
    UpdateUserRoleResponse
} from '@randomstack/commons'
import {FILE_TYPE, TABLE} from '@randomstack/commons'

export {login, getMe, logout} from './auth'

// ─── Technologies (admin /ws) ────────────────────────────────────────────────

export const fetchTechnologies = async (): Promise<AdminTechnologyListed[]> => {
    return await ApiClient.get<AdminTechnologyListed[]>('/ws/fetch-technologies')
}

export const fetchTechnologyFormData = async (id?: string): Promise<EditTechnologyFormBean> => {
    return await ApiClient.get<EditTechnologyFormBean>(
        `/ws/fetch-technology-init-form-data${id ? `/${id}` : ''}`
    )
}

export const saveTechnology = async (
    payload: EditTechnologyFormBean,
    id?: string
): Promise<{success: boolean; technology: AdminTechnologyListed}> => {
    const endpoint = id ? `/ws/save-technology/${id}` : '/ws/save-technology'
    return await ApiClient.post(endpoint, payload)
}

// ─── Posts (admin /ws) ───────────────────────────────────────────────────────

export const fetchPostFormData = async (id?: string): Promise<EditPostFormBean> => {
    return await ApiClient.get<EditPostFormBean>(
        `/ws/fetch-post-form-data${id ? `/${id}` : ''}`
    )
}

export const fetchEditorialAuthors = async (): Promise<EditorialAuthorLite[]> => {
    return await ApiClient.get<EditorialAuthorLite[]>('/ws/fetch-editorial-authors')
}

// ─── Users (admin /ws — ADMIN only) ──────────────────────────────────────────

export const fetchUsers = async (): Promise<AdminUserListed[]> => {
    return await ApiClient.get<AdminUserListed[]>('/ws/fetch-users')
}

export const fetchUserById = async (id: string): Promise<AdminUserDetail> => {
    return await ApiClient.get<AdminUserDetail>(`/ws/fetch-user/${id}`)
}

export const updateUserRole = async (
    id: string,
    role: Role
): Promise<UpdateUserRoleResponse> => {
    return await ApiClient.post<UpdateUserRoleResponse>(`/ws/update-user-role/${id}`, {role})
}

export const createUser = async (payload: CreateUserFormBean): Promise<CreateUserResponse> => {
    return await ApiClient.post<CreateUserResponse>('/ws/create-user', payload)
}

export const fetchPosts = async (): Promise<AdminPostListed[]> => {
    return await ApiClient.get<AdminPostListed[]>('/ws/fetch-posts')
}

export const savePost = async (
    payload: EditPostFormBean,
    id?: string
): Promise<{success: boolean; post: AdminPostListed}> => {
    const endpoint = `/ws/save-post${id ? `/${id}` : ''}`
    return await ApiClient.post(endpoint, payload)
}

export const deletePost = async (id: string): Promise<{success: boolean}> => {
    return await ApiClient.delete<{success: boolean}>(`/ws/delete-post/${id}`)
}

export const purgePost = async (id: string): Promise<{success: boolean}> => {
    return await ApiClient.delete<{success: boolean}>(`/ws/purge-post/${id}`)
}

export const fetchTags = async (): Promise<string[]> => {
    return await ApiClient.get<string[]>('/ws/fetch-tags')
}

// ─── Files (public WebService) ───────────────────────────────────────────────

export const uploadFile = async (
    file: File,
    type: FileType = FILE_TYPE.IMAGE,
    category: Table = TABLE.TECHNOLOGY
): Promise<{idFile: string; url: string}> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    formData.append('category', category)

    return await ApiClient.postForm('/upload-file', formData)
}

/** URL stable fichier via l’API (`/files/:id` → 302 signed Railway en prod). */
export const fileUrl = (id: string | null | undefined): string => {
    if (!id) return ''
    return `${ApiClient.baseUrl}/files/${id}`
}
