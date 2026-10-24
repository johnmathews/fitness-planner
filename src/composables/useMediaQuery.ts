import { onScopeDispose, ref, type Ref } from 'vue'

/**
 * Whether a CSS media query matches, kept up to date as it changes. Listens until the calling
 * scope (a component's setup) ends. Where `matchMedia` is missing (jsdom) it is always false.
 */
export function useMediaQuery(query: string): Ref<boolean> {
  const list = window.matchMedia?.(query)
  const matches = ref(list?.matches ?? false)
  function onChange(ev: MediaQueryListEvent): void {
    matches.value = ev.matches
  }
  list?.addEventListener('change', onChange)
  onScopeDispose(() => list?.removeEventListener('change', onChange), true)
  return matches
}
