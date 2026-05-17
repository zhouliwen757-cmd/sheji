import { ref } from 'vue'

const toastMessage = ref('')
const toastType = ref('info')
const toastKey = ref(0)

export function useToast() {
  const showToast = (message, type = 'info', duration = 3000) => {
    toastMessage.value = message
    toastType.value = type
    toastKey.value++
  }

  const success = (message, duration = 3000) => showToast(message, 'success', duration)
  const error = (message, duration = 3000) => showToast(message, 'error', duration)
  const info = (message, duration = 3000) => showToast(message, 'info', duration)

  return {
    toastMessage,
    toastType,
    toastKey,
    showToast,
    success,
    error,
    info
  }
}
