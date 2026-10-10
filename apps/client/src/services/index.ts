import ApiClient from './api.client'
import type {Technology, DrawnStack, DrawResponse, Post} from '@randomstack/commons'

export type ClientTechnology = Technology
export type {DrawnStack, DrawResponse}

export type PublishedPostsResponse = {
    featured: Post | null
    posts: Post[]
}

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

export const fetchShare = async (code: string): Promise<{
    projectType: string
    clientLayer: Technology | null
    serverLayer: Technology | null
    databaseLayer: Technology | null
    timestamp: string
}> => {
    return await ApiClient.get(`/fetch-share/${code}`)
}

export const fetchDrawTechnologies = async (): Promise<Technology[]> => {
    return await ApiClient.get<Technology[]>('/fetch-draw-technologies')
}

export const fetchAllTechnologies = async (): Promise<Technology[]> => {
    return await ApiClient.get<Technology[]>('/fetch-technologies')
}

export const fetchTechnologyBySlug = async (slug: string): Promise<Technology> => {
    return await ApiClient.get<Technology>(`/fetch-technology-by-slug/${slug}`)
}

// ─── Blog ────────────────────────────────────────────────────────────────────

export const fetchPostBySlug = async (slug: string, isPreview: boolean = false): Promise<Post> => {
    const query = isPreview ? '?preview=true' : ''
    return await ApiClient.get<Post>(`/fetch-post/${slug}${query}`)
}

export const fetchPublishedPosts = async (): Promise<PublishedPostsResponse> => {
    return await ApiClient.get<PublishedPostsResponse>('/fetch-posts')
}

export const fetchPostsByTag = async (tag: string): Promise<PublishedPostsResponse> => {
    return await ApiClient.get<PublishedPostsResponse>(`/fetch-posts/tag/${tag}`)
}
