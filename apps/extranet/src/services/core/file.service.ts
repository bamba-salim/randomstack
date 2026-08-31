import ApiClient from '../api.client'

export default class FileService extends ApiClient {
    // Service générique pour uploader n'importe quel fichier 🚀
    static async uploadFile(file: File, type: 'image' | 'video' | 'document' | 'other', category: string): Promise<{ id: string; url: string }> {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)
        formData.append('category', category)

        return await this.postForm<{ id: string; url: string }>('/api/admin/upload-file', formData)
    }
}