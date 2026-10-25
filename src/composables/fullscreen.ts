import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * The browser's full screen for the whole page (Header card, K34). `supported` is false where the
 * page can't go full screen, as on an iPhone, and the Header then leaves its button out. Esc, the
 * browser's own way out, is picked up through `fullscreenchange`.
 */
export function useFullscreen() {
  const supported = typeof document !== 'undefined' && document.fullscreenEnabled === true
  const active = ref(false)
  const sync = (): void => {
    active.value = document.fullscreenElement !== null
  }

  async function toggle(): Promise<void> {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      // Refused (no user gesture, or a policy): the page simply stays as it is.
    }
  }

  onMounted(() => {
    sync()
    document.addEventListener('fullscreenchange', sync)
  })
  onBeforeUnmount(() => document.removeEventListener('fullscreenchange', sync))

  return { supported, active, toggle }
}
