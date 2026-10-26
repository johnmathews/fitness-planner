import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { REST_MS, sprintTarget, useScreenSprint } from '@/composables/screenSprint'

describe('sprintTarget (K38)', () => {
  // Two screens: Exercises 0–1300 (taller than the 800px window), Food from 1300.
  const starts = [0, 1300]

  it('leaves a scroll alone inside one screen, a tall one included', () => {
    expect(sprintTarget(0, 800, starts, 1)).toBeNull()
    expect(sprintTarget(300, 800, starts, 1)).toBeNull()
    expect(sprintTarget(500, 800, starts, -1)).toBeNull()
    expect(sprintTarget(1300, 800, starts, -1)).toBeNull()
  })

  it('sprints on in the direction of travel when both screens show', () => {
    expect(sprintTarget(520, 800, starts, 1)).toBe(1300)
    expect(sprintTarget(1200, 800, starts, -1)).toBe(500)
  })

  it('settles on the screen that fills more of the window when nobody scrolled (K40)', () => {
    // Food shows from 1300 to 1400 of 600–1400: Exercises fills more, so back to its end.
    expect(sprintTarget(600, 800, starts, 0)).toBe(500)
    // Food shows from 1300 to 1500 of 700–1500: it is half-way, so Food (ties go down).
    expect(sprintTarget(1100, 800, starts, 0)).toBe(1300)
    expect(sprintTarget(300, 800, starts, 0)).toBeNull()
  })

  it('counts a line within a pixel of the edge as no line', () => {
    expect(sprintTarget(500.5, 800, starts, 1)).toBeNull()
    expect(sprintTarget(1299.5, 800, starts, 1)).toBeNull()
  })
})

describe('useScreenSprint', () => {
  let scrollTo: ReturnType<typeof vi.fn<(options: ScrollToOptions) => void>>

  /** Puts the window at `y` and lets the scroll come to rest. */
  function scrollToY(y: number): void {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
    window.dispatchEvent(new Event('scroll'))
  }

  function screens(): void {
    document.body.innerHTML =
      '<section data-planner-screen></section><section data-planner-screen></section>'
    const [ex, food] = document.querySelectorAll<HTMLElement>('[data-planner-screen]')
    // Rectangles relative to the window, as the browser gives them.
    ex!.getBoundingClientRect = () => ({ top: -window.scrollY }) as DOMRect
    food!.getBoundingClientRect = () => ({ top: 1300 - window.scrollY }) as DOMRect
  }

  function holder(enabled = ref(true)) {
    return mount(
      defineComponent({
        setup() {
          useScreenSprint(enabled)
          return () => h('div')
        },
      }),
    )
  }

  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
    scrollTo = vi.fn<(options: ScrollToOptions) => void>()
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo
    screens()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('sprints down to Food once a scroll comes to rest across the line, smoothly', () => {
    const wrapper = holder()
    scrollToY(300)
    vi.advanceTimersByTime(REST_MS)
    expect(scrollTo).not.toHaveBeenCalled()
    scrollToY(600)
    vi.advanceTimersByTime(REST_MS - 1)
    expect(scrollTo).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(scrollTo).toHaveBeenCalledWith({ top: 1300, behavior: 'smooth' })
    wrapper.unmount()
  })

  it('sprints back up to the end of Exercises, at once when motion is reduced', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn<(q: string) => MediaQueryList>(
        (q) => ({ matches: q.includes('reduce') }) as unknown as MediaQueryList,
      ),
    )
    const wrapper = holder()
    scrollToY(1300)
    vi.advanceTimersByTime(REST_MS)
    scrollToY(1300)
    scrollToY(1100)
    vi.advanceTimersByTime(REST_MS)
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 500, behavior: 'auto' })
    wrapper.unmount()
  })

  it('settles a resize or rotation on the screen that fills more of the window', () => {
    const wrapper = holder()
    // A scroll down sets a direction; the resize after it clears it.
    scrollToY(100)
    vi.advanceTimersByTime(REST_MS)
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 600 })
    window.dispatchEvent(new Event('resize'))
    vi.advanceTimersByTime(REST_MS)
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 500, behavior: 'smooth' })
    wrapper.unmount()
  })

  it('does nothing while switched off, and stops a pending sprint when it is', async () => {
    const enabled = ref(true)
    const wrapper = holder(enabled)
    scrollToY(600)
    enabled.value = false
    await nextTick()
    vi.advanceTimersByTime(REST_MS)
    scrollToY(700)
    vi.advanceTimersByTime(REST_MS)
    expect(scrollTo).not.toHaveBeenCalled()
    enabled.value = true
    await nextTick()
    wrapper.unmount()
    scrollToY(650)
    vi.advanceTimersByTime(REST_MS)
    expect(scrollTo).not.toHaveBeenCalled()
  })
})
