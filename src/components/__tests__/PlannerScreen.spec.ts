/**
 * The planner's screens (PlannerScreen and Header cards, K24–K27): the bar out of sight until
 * wanted, the way on to Food, and the ordinary sticky bar in Edit plan, mounted in the real app.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'
import { HIDE_AFTER_MS } from '@/composables/barReveal'
import { signedIn } from '@/lib/__tests__/signedIn'

const NOW = new Date(2026, 9, 23, 18, 0)

let wrapper: VueWrapper

function mountApp(): VueWrapper {
  signedIn()
  const pinia = createPinia()
  setActivePinia(pinia)
  wrapper = mount(App, { global: { plugins: [pinia] }, attachTo: document.body })
  return wrapper
}

const bar = () => wrapper.get('[data-slot="bar"]')
const shown = () => bar().attributes('data-shown')
const handle = () => wrapper.get('[data-slot="bar-handle"]')
/** The strip along the top edge: the first child of the app, before the handle. */
const strip = () => wrapper.get('div[aria-hidden="true"].fixed')
const mouse = { pointerType: 'mouse' }
const finger = { pointerType: 'touch' }
/** A pointer event at a height on the screen (trigger can't set clientY). */
async function press(el: Element, type: string, clientY: number): Promise<void> {
  el.dispatchEvent(new MouseEvent(type, { clientY, bubbles: true }))
  await flushPromises()
}

describe('the planner’s screens (K24–K27)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] })
    vi.setSystemTime(NOW)
    localStorage.clear()
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('marks <html> for the screens, and lifts the mark in Edit plan, where the bar is sticky', async () => {
    mountApp()
    expect(document.documentElement.classList.contains('planner-screens')).toBe(true)
    expect(shown()).toBe('false')
    await wrapper.get('[data-testid="edit-plan-button"]').trigger('click')
    expect(document.documentElement.classList.contains('planner-screens')).toBe(false)
    expect(bar().attributes('data-shown')).toBeUndefined()
    expect(wrapper.find('[data-slot="bar-handle"]').exists()).toBe(false)
  })

  it('brings the bar from the top edge for a pointer, not a finger, and hides it after leaving', async () => {
    mountApp()
    await strip().trigger('pointerenter', finger)
    expect(shown()).toBe('false')
    await strip().trigger('pointerenter', mouse)
    expect(shown()).toBe('true')
    // Back on the bar before the delay runs out keeps it.
    await bar().trigger('pointerleave', mouse)
    await bar().trigger('pointerenter', mouse)
    vi.advanceTimersByTime(HIDE_AFTER_MS)
    await flushPromises()
    expect(shown()).toBe('true')
    // A finger leaving does nothing; the pointer leaving hides it after the delay.
    await bar().trigger('pointerleave', finger)
    vi.advanceTimersByTime(HIDE_AFTER_MS)
    await flushPromises()
    expect(shown()).toBe('true')
    await bar().trigger('pointerleave', mouse)
    vi.advanceTimersByTime(HIDE_AFTER_MS)
    await flushPromises()
    expect(shown()).toBe('false')
  })

  it('ignores the pointer entering the bar while it is out of sight, and keeps it while focus is inside', async () => {
    mountApp()
    await bar().trigger('pointerenter', mouse)
    expect(shown()).toBe('false')
    await bar().trigger('pointerenter', finger)
    await strip().trigger('pointerenter', mouse)
    ;(wrapper.get('[data-testid="settings-button"]').element as HTMLElement).focus()
    await bar().trigger('pointerleave', mouse)
    vi.advanceTimersByTime(HIDE_AFTER_MS)
    await flushPromises()
    expect(shown()).toBe('true')
  })

  it('toggles the bar with the handle, and shows it when the handle is pulled down', async () => {
    mountApp()
    expect(handle().attributes('tabindex')).toBe('-1')
    await handle().trigger('click')
    expect(shown()).toBe('true')
    expect(handle().attributes('aria-expanded')).toBe('true')
    await handle().trigger('click')
    expect(shown()).toBe('false')
    await press(handle().element, 'pointerdown', 0)
    await press(handle().element, 'pointermove', 6)
    expect(shown()).toBe('false')
    await press(handle().element, 'pointermove', 20)
    expect(shown()).toBe('true')
    // A move without a press first does nothing more.
    await press(handle().element, 'pointermove', 40)
    expect(shown()).toBe('true')
  })

  it('hides the bar on a press elsewhere, but not on one inside it', async () => {
    mountApp()
    await handle().trigger('click')
    document
      .querySelector('[data-slot="bar"] button')!
      .dispatchEvent(new Event('pointerdown', { bubbles: true }))
    vi.advanceTimersByTime(0)
    await flushPromises()
    expect(shown()).toBe('true')
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    vi.advanceTimersByTime(0)
    await flushPromises()
    expect(shown()).toBe('false')
    // A press while it is out of sight changes nothing.
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(shown()).toBe('false')
  })

  it('hides the bar on Escape, taking focus out of it', async () => {
    mountApp()
    await handle().trigger('click')
    const settings = wrapper.get('[data-testid="settings-button"]').element as HTMLElement
    settings.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(shown()).toBe('true')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(shown()).toBe('false')
    expect(document.activeElement).not.toBe(settings)
    // Escape with focus elsewhere just hides it.
    await handle().trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(shown()).toBe('false')
  })

  it('leaves Escape and presses alone in Edit plan', async () => {
    mountApp()
    await handle().trigger('click')
    await wrapper.get('[data-testid="edit-plan-button"]').trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(bar().attributes('data-shown')).toBeUndefined()
  })

  it('sprints between the screens from the arrows, named for where they go (K42)', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn<(q: string) => MediaQueryList>(
        (q) =>
          ({
            matches: q.includes('reduce'),
            addEventListener() {},
            removeEventListener() {},
          }) as unknown as MediaQueryList,
      ),
    )
    mountApp()
    const scrollTo = vi.fn<(options: ScrollToOptions) => void>()
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo
    const food = document.querySelector<HTMLElement>('[aria-labelledby="diet-heading"]')!
    food.getBoundingClientRect = () => ({ top: 800 }) as DOMRect
    const down = wrapper.get('[data-testid="to-food"]')
    expect(down.attributes('aria-label')).toBe('Go to Food')
    expect(down.text()).toBe('')
    await down.trigger('click')
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 800, behavior: 'auto' })
    const exercises = document.querySelector<HTMLElement>('[aria-labelledby="exercises-heading"]')!
    exercises.getBoundingClientRect = () => ({ top: -800 }) as DOMRect
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 800 })
    const up = wrapper.get('[data-testid="to-exercises"]')
    expect(up.attributes('aria-label')).toBe('Back to Exercises')
    await up.trigger('click')
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'auto' })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
    vi.unstubAllGlobals()
  })
})
