import { ref } from 'vue'

export const isThemeModalOpen = ref(false)

export function openThemeModal() {
  isThemeModalOpen.value = true
}

export function closeThemeModal() {
  isThemeModalOpen.value = false
}
