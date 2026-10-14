import ApiClient from './api.client'
import type {
    DrawnStack,
    DrawResponse,
    DrawTechnologyLite,
    PublicTechnologyListed,
    PublicTechnologyDetail,
    ExcludeTechnologyLite,
    PublicPostDetail,
    PublicPostListed,
    PostShareResolved,
    PublishedPostsResponse,
    SharedStackListed,
    CommentsListResponse,
    CreateCommentResponse,
    VoteCommentResponse,
    CommentVoteType,
    PublicProfileListed,
    FavoritesListResponse,
    ToggleFavoriteResponse,
    FileType,
    Table
} from '@randomstack/commons'
import {FILE_TYPE, TABLE} from '@randomstack/commons'

export type {
    DrawnStack,
    DrawResponse,
    DrawTechnologyLite,
    PublicTechnologyListed,
    PublicTechnologyDetail,
    ExcludeTechnologyLite,
    PublicPostDetail,
    PublicPostListed,
    PublishedPostsResponse,
    SharedStackListed
}

export {login, register, getMe, updateProfile, logout, clearAuthCache} from './auth'

// ─── Stack / tirage ──────────────────────────────────────────────────────────

export const triggerDraw = async (payload: {
    locks: {client: boolean; server: boolean; database: boolean}
    currentStack: DrawnStack | null
    blacklist: string[]
    projectType?: string
}): Promise<DrawResponse> => {
    return await ApiClient.post<DrawResponse>('/draw-stack', payload)
}

export const fetchHistory = async (): Promise<DrawnStack[]> => {
    const data = await ApiClient.get<{history: DrawnStack[]}>('/fetch-draw-history')
    return data.history
}

export const saveShare = async (payload: {
    projectType: string
    frontendId: string
    backendId: string
    databaseId: string
    ormId?: string | null
}): Promise<{success: boolean; shareCode: string; expiresAt: string}> => {
    return await ApiClient.post('/save-share', payload)
}

export const fetchShare = async (code: string): Promise<SharedStackListed> => {
    return await ApiClient.get<SharedStackListed>(`/fetch-share/${code}`)
}

export const fetchDrawTechnologies = async (): Promise<ExcludeTechnologyLite[]> => {
    return await ApiClient.get<ExcludeTechnologyLite[]>('/fetch-draw-technologies')
}

export const fetchAllTechnologies = async (): Promise<PublicTechnologyListed[]> => {
    return await ApiClient.get<PublicTechnologyListed[]>('/fetch-technologies')
}

export const fetchTechnologyBySlug = async (slug: string): Promise<PublicTechnologyDetail> => {
    return await ApiClient.get<PublicTechnologyDetail>(`/fetch-technology-by-slug/${slug}`)
}

// ─── Blog ────────────────────────────────────────────────────────────────────

/** Lecture article par slug (URL canonique `/{tag}/{slug}`). */
export const fetchPostBySlug = async (slug: string): Promise<PublicPostDetail> => {
    return await ApiClient.get<PublicPostDetail>(`/fetch-post/${encodeURIComponent(slug)}`)
}

/** Prévisualisation staff (cookie session). */
export const fetchPostPreview = async (shareCode: string): Promise<PublicPostDetail> => {
    return await ApiClient.get<PublicPostDetail>(
        `/fetch-post-preview/${encodeURIComponent(shareCode)}`
    )
}

/** Charge la page de partage `/post/:shareCode`. */
export const resolvePostShareCode = async (shareCode: string): Promise<PostShareResolved> => {
    return await ApiClient.get<PostShareResolved>(
        `/fetch-post-by-code/${encodeURIComponent(shareCode)}`
    )
}

export const fetchPublishedPosts = async (): Promise<PublishedPostsResponse> => {
    return await ApiClient.get<PublishedPostsResponse>('/fetch-posts')
}

export const fetchPostsByTag = async (tag: string): Promise<PublishedPostsResponse> => {
    return await ApiClient.get<PublishedPostsResponse>(`/fetch-posts/tag/${tag}`)
}

/** Similaires par tags, complétés par les derniers publiés (serveur). */
export const fetchSimilarPosts = async (slug: string): Promise<PublicPostListed[]> => {
    return await ApiClient.get<PublicPostListed[]>(`/fetch-similar-posts/${encodeURIComponent(slug)}`)
}

/** Articles publiés du même auteur (exclut l’article courant si `excludePostId`). */
export const fetchPostsByAuthor = async (
    authorId: string,
    excludePostId?: string
): Promise<PublicPostListed[]> => {
    const query = excludePostId ? `?exclude=${encodeURIComponent(excludePostId)}` : ''
    return await ApiClient.get<PublicPostListed[]>(`/fetch-posts/author/${authorId}${query}`)
}

export const fetchComments = async (postId: string): Promise<CommentsListResponse> => {
    return await ApiClient.get<CommentsListResponse>(`/fetch-comments/${postId}`)
}

export const createComment = async (
    postId: string,
    content: string
): Promise<CreateCommentResponse> => {
    return await ApiClient.post<CreateCommentResponse>('/create-comment', {postId, content})
}

export const voteComment = async (
    commentId: string,
    vote: CommentVoteType | null
): Promise<VoteCommentResponse> => {
    return await ApiClient.post<VoteCommentResponse>(`/vote-comment/${commentId}`, {vote})
}

export const deleteComment = async (commentId: string): Promise<{success: boolean}> => {
    return await ApiClient.delete<{success: boolean}>(`/delete-comment/${commentId}`)
}

export const fetchPublicProfile = async (id: string): Promise<PublicProfileListed> => {
    return await ApiClient.get<PublicProfileListed>(`/fetch-profile/${id}`)
}

export const fetchFavorites = async (): Promise<FavoritesListResponse> => {
    return await ApiClient.get<FavoritesListResponse>('/fetch-favorites')
}

export const toggleFavorite = async (postId: string): Promise<ToggleFavoriteResponse> => {
    return await ApiClient.post<ToggleFavoriteResponse>(`/toggle-favorite/${postId}`)
}

export const uploadFile = async (
    file: File,
    type: FileType = FILE_TYPE.IMAGE,
    category: Table = TABLE.USER
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
