export class ApiError extends Error {
    field?: string
    errors?: Record<string, string>
    status?: number

    constructor(
        message: string,
        opts?: {field?: string; errors?: Record<string, string>; status?: number}
    ) {
        super(message)
        this.name = 'ApiError'
        this.field = opts?.field
        this.errors = opts?.errors
        this.status = opts?.status
    }
}

async function rejectResponse(response: Response): Promise<never> {
    const errorData = await response.json().catch(() => ({} as {
        error?: string
        field?: string
        errors?: Record<string, string>
    }))
    throw new ApiError(errorData.error || `HTTP Error: ${response.status}`, {
        field: errorData.field,
        errors: errorData.errors,
        status: response.status
    })
}

export default class ApiClient {
    static readonly baseUrl = import.meta.env['VITE_API_URL'] || 'http://localhost:4000'

    static async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            credentials: 'include'
        })
        if (!response.ok) await rejectResponse(response)
        return await response.json()
    }

    static async post<T>(endpoint: string, body?: unknown): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: body ? JSON.stringify(body) : undefined,
            credentials: 'include'
        })
        if (!response.ok) await rejectResponse(response)
        return await response.json()
    }

    static async postForm<T>(endpoint: string, formData: FormData): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        if (!response.ok) await rejectResponse(response)
        return await response.json()
    }

    static async delete<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        if (!response.ok) await rejectResponse(response)
        return await response.json()
    }
}
