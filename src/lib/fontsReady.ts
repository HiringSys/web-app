import { ref } from 'vue'

const ready = ref(false)

if (typeof document !== 'undefined' && 'fonts' in document) {
  document.fonts.ready.then(() => { ready.value = true })
}

export function useFontsReady() {
  return ready
}
