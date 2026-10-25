import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useFullscreen } from '@/composables/fullscreen'

/** Mounts a component that holds the composable, and hands it back. */
function holder() {
  let api!: ReturnType<typeof useFullscreen>
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useFullscreen()
        return () => h('div')
      },
    }),
  )
  return { api, wrapper }
}

describe('useFullscreen (K34)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: undefined })
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null })
  })

  it('is unsupported where the browser has no full screen, as on an iPhone', () => {
    Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: undefined })
    expect(holder().api.supported).toBe(false)
  })

  it('enters full screen for the whole page, and leaves it when already there', async () => {
    Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: true })
    const request = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    document.documentElement.requestFullscreen = request
    const { api } = holder()
    expect(api.supported).toBe(true)
    await api.toggle()
    expect(request).toHaveBeenCalledOnce()

    const exit = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    document.exitFullscreen = exit
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: document.documentElement,
    })
    document.dispatchEvent(new Event('fullscreenchange'))
    expect(api.active.value).toBe(true)
    await api.toggle()
    expect(exit).toHaveBeenCalledOnce()
  })

  it('stays put when the browser refuses', async () => {
    Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: true })
    document.documentElement.requestFullscreen = vi
      .fn<() => Promise<void>>()
      .mockRejectedValue(new Error('denied'))
    await expect(holder().api.toggle()).resolves.toBeUndefined()
  })
})
