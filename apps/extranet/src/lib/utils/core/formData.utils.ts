export default class FormDataUtils {
    // Convertit un objet TypeScript plat en FormData d'upload 🚀
    static toFormData(obj: Record<string, any>): FormData {
        const formData = new FormData()
        Object.keys(obj).forEach(key => {
            const value = obj[key]
            if (value !== undefined && value !== null) {
                if (value instanceof File) {
                    formData.append(key, value)
                } else {
                    formData.append(key, String(value))
                }
            }
        })
        return formData
    }
}