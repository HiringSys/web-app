import { ref } from 'vue'

const ready = ref(false)

if (typeof document !== 'undefined' && 'fonts' in document) {
  document.fonts.ready.then(() => { ready.value = true })
}

/** Flips once to true after web fonts finish loading — use as a dependency to force a recompute of anything that measured text before then. */
export function useFontsReady() {
  return ready
}
