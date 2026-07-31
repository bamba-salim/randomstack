export default class ApiClient {
    protected static baseUrl = import.meta.env['VITE_API_URL'] || 'http://localhost:4000'

    protected static async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            credentials: 'include'
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
            throw new Error(`HTTP Error: ${response.status}`)
        }
        return await response.json()
    }
}