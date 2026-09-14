import ApiClient from '../api.client'
import {FILE_TYPE, TABLE} from '@randomstack/commons'

export default class FileService extends ApiClient {
    // Service générique pour uploader n'importe quel fichier 🚀
    static async uploadFile(file: File, type: FILE_TYPE, category: TABLE): Promise<{ id: string; url: string }> {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)
        formData.append('category', category)

        return await this.postForm<{ id: string; url: string }>('/api/admin/upload-file', formData)
    }
}