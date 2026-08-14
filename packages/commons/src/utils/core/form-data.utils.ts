export default class FormDataUtils {
    static toFormData(obj: Record<string, any>): FormData {
        const formData = new FormData()

        Object.keys(obj).forEach(key => {
            const value = obj[key]

            if (value !== undefined && value !== null) {
                if (value instanceof File) {
                    formData.append(key, value)
                } else if (Array.isArray(value)) {
                    // Si c'est un tableau (ex: history ou categories), on append chaque élément individuellement 🚀
                    value.forEach(item => {
                        formData.append(key, String(item))
                    })
                } else {
                    formData.append(key, String(value))
                }
            }
        })

        return formData
    }
}