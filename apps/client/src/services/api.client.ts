export default class ApiClient {
    private static baseUrl = import.meta.env['VITE_API_URL'] || 'http://localhost:4000'

    static async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`)
        }
        return await response.json()
    }

    static async post<T>(endpoint: string, body?: unknown): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: body ? JSON.stringify(body) : undefined,
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`)
        }
        return await response.json()
    }

    static async postForm<T>(endpoint: string, formData: FormData): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`)
        }
        return await response.json()
    }
}
