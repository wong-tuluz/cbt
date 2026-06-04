// hooks/use-toast.ts
import { ref } from 'vue'

export type ToastVariant = 'default' | 'destructive' | 'success'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  const toast = ({
    title,
    description,
    variant = 'default',
    duration = 5000
  }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9) + Date.now().toString()

    const newToast: Toast = {
      id,
      title,
      description,
      variant
    }

    toasts.value.push(newToast)

    // Auto dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }

    return { id }
  }

  const dismiss = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const dismissAll = () => {
    toasts.value = []
  }

  const success = (title: string, description?: string, duration?: number) => {
    return toast({ title, description, variant: 'success', duration })
  }

  const error = (title: string, description?: string, duration?: number) => {
    return toast({ title, description, variant: 'destructive', duration })
  }

  return {
    toasts,
    toast,
    success,
    error,
    dismiss,
    dismissAll
  }
}