/**
 * jsdom gaps that Reka UI's overlays and roving focus reach for. Imported by the specs that mount
 * them, so the rest of the suite runs on plain jsdom.
 */
import { afterEach } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver ??= ResizeObserverStub
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.releasePointerCapture ??= () => {}
Element.prototype.scrollIntoView ??= () => {}

afterEach(() => {
  // Specs attach to document.body for focus; teleported layers and Reka's focus guards stay behind.
  document.body.replaceChildren()
})
// Registered second so it runs first (after-hooks unwind as a stack): unmount, then clear.
enableAutoUnmount(afterEach)

/** Lets Reka's queued work (nextTick chains, focus-outside checks, presence) settle. */
export async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++) await new Promise((resolve) => setTimeout(resolve, 0))
}
