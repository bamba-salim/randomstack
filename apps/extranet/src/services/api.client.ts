export default class ApiClient {
    protected static baseUrl = import.meta.env['VITE_API_URL'] || 'http://localhost:4000'

    protected static async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            credentials: 'include' // Requis pour échanger le cookie de session connect.sid 🚀
        })
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`)
        }
        return await response.json()
    }

    protected static async post<T>(endpoint: string, body?: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
            credentials: 'include'
        })
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || `HTTP Error: ${response.status}`)
        }
        return await response.json()
    }

    protected static async put<T>(endpoint: string, body?: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
            credentials: 'include'
        })
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || `HTTP Error: ${response.status}`)
        }
        return await response.json()
    }

    protected static async postForm<T>(endpoint: string, formData: FormData): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            body: formData, // Laisse le navigateur fixer le boundary de multipart
            credentials: 'include'
        })
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || `HTTP Error: ${response.status}`)
        }
        return await response.json()
    }


}