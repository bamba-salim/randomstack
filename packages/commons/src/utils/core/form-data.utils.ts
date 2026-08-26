export default class FormDataUtils {
    static toFormData(obj: Record<string, any>): FormData {
        const formData = new FormData()

        Object.keys(obj).forEach(key => {
            const value = obj[key]

            if (value !== undefined && value !== null) {
                if (value instanceof File) {
                    formData.append(key, value)
                } else if (Array.isArray(value)) {
                    // Si c'est un tableau de blocs (content) ou de tags
                    // On stringifie UNE SEULE FOIS pour le transport
                    formData.append(key, JSON.stringify(value))
                } else if (typeof value === 'object') {
                    // Si c'est un objet (ex: versions), on stringifie UNE SEULE FOIS
                    formData.append(key, JSON.stringify(value))
                } else {
                    formData.append(key, String(value))
                }
            }
        })

        return formData
    }
}