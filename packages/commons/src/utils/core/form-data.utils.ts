export default class FormDataUtils {
    static toFormData(obj: Record<string, any>): FormData {
        const formData = new FormData()

        Object.keys(obj).forEach(key => {
            const value = obj[key]

            if (value !== undefined && value !== null) {
                if (value instanceof File) {

                    formData.append(key, value)

                } else if (Array.isArray(value)) {

                    value.forEach(item => formData.append(key, String(item)))

                } else if (typeof value === 'object') {

                    formData.append(key, JSON.stringify(value))

                } else {
                    formData.append(key, String(value))
                }
            }
        })

        return formData
    }
}