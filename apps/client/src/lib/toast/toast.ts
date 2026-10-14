import {ref, readonly} from 'vue'

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastItem {
    id: number
    kind: ToastKind
    message: string
}

const toasts = ref<ToastItem[]>([])
let seq = 0

const dismiss = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
}

const push = (kind: ToastKind, message: string, duration = 3500) => {
    const text = String(message || '').trim()
    if (!text) return
    const id = ++seq
    toasts.value = [...toasts.value, {id, kind, message: text}]
    window.setTimeout(() => dismiss(id), duration)
}

export const toast = {
    success: (message: string, duration?: number) => push('success', message, duration ?? 3500),
    error: (message: string, duration?: number) => push('error', message, duration ?? 4500),
    info: (message: string, duration?: number) => push('info', message, duration ?? 3500),
    dismiss
}

export function useToasts() {
    return {toasts: readonly(toasts), dismiss}
}
