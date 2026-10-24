import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'
import { CACHE_PREFIX } from '@/stores/sync'
import type { FakeApi } from '@/lib/__tests__/fakeApi'
import { USER, emptyState, signedIn } from '@/lib/__tests__/signedIn'

const NOW = new Date(2026, 9, 23, 18, 0)

let wrapper: VueWrapper
let api: FakeApi

/** Mount the app signed in as alice, with an empty account. */
function mountApp(): VueWrapper {
  api = signedIn()
  const pinia = createPinia()
  setActivePinia(pinia)
  wrapper = mount(App, { global: { plugins: [pinia] }, attachTo: document.body })
  return wrapper
}

/** Mount with config mode on, where the plan-editing controls are. */
async function mountConfig(): Promise<VueWrapper> {
  mountApp()
  await wrapper.get('button[role="switch"]').trigger('click')
  return wrapper
}

function diet() {
  return wrapper.get('[data-testid="diet-grid"]')
}

function cells(name: string) {
  return diet().findAll(`button[aria-label^="${name},"]`)
}

describe('DietSection', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    localStorage.clear()
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.unstubAllGlobals()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders below the exercises with the default foods and no reps chips', () => {
    mountApp()
    expect(wrapper.get('#diet-heading').text()).toBe('Diet')
    expect(
      diet()
        .findAll('[data-testid="item-name"]')
        .map((n) => n.text()),
    ).toEqual(['Vegetables', 'Fruit', 'Fish', 'Nuts'])
    expect(diet().findAll('[data-testid="item-detail"]')).toHaveLength(0)
    expect(diet().get('[role="columnheader"]').text()).toBe('Food')
    expect(diet().findAll('[data-testid="day-head"]')[4]!.attributes('data-today')).toBe('true')
  })

  it('ticks a food, updating its total, the footer, and goals met', async () => {
    mountApp()
    const goals = () => wrapper.get('[data-testid="diet-goals-met"]').text()
    expect(goals()).toBe('0 / 4')
    await cells('Fish')[0]!.trigger('click')
    await cells('Fish')[2]!.trigger('click')
    expect(cells('Fish')[2]!.attributes('aria-pressed')).toBe('true')
    const total = diet().findAll('[data-testid="row-total"]')[2]!
    expect(total.text()).toBe('2 / 2')
    expect(total.attributes('data-met')).toBe('true')
    const counts = diet().findAll('[data-testid="day-count"]')
    expect(counts.map((c) => c.text())).toEqual(['1', '0', '1', '0', '0', '0', '0'])
    expect(counts[0]!.attributes('data-tone')).toBe('plain')
    expect(counts[1]!.attributes('data-tone')).toBe('under')
    expect(goals()).toBe('1 / 4')
    // The exercise totals are untouched.
    expect(wrapper.get('[data-testid="grand-total"]').text()).toBe('0')
  })

  it('moves with the shared week navigation', async () => {
    mountApp()
    await cells('Fruit')[0]!.trigger('click')
    await wrapper.get('button[aria-label="Previous week"]').trigger('click')
    expect(cells('Fruit')[0]!.attributes('aria-pressed')).toBe('false')
    await wrapper.get('button[aria-label="Next week"]').trigger('click')
    expect(cells('Fruit')[0]!.attributes('aria-pressed')).toBe('true')
  })

  it('adds a food, syncs it, and removes one after confirmation', async () => {
    await mountConfig()
    await wrapper.get('#add-food-name').setValue('Beans')
    await wrapper.get('#add-food-name').trigger('submit')
    expect(diet().findAll('[data-testid="item-name"]').at(-1)!.text()).toBe('Beans')
    expect((wrapper.get('#add-food-name').element as HTMLInputElement).value).toBe('')
    await flushPromises()
    const plan = api.accounts.get(USER)!.plans.diet['2026-10-19']!.items as { name: string }[]
    expect(plan.at(-1)!.name).toBe('Beans')

    await diet().get('button[aria-label="Remove Nuts"]').trigger('click')
    await flushPromises()
    // Reka renders the ConfirmDialog in a portal on document.body.
    const dialog = document.querySelector<HTMLElement>('[role="alertdialog"]')!
    expect(dialog.querySelector('h2')!.textContent).toBe('Remove Nuts?')
    ;[...dialog.querySelectorAll('button')].find((b) => b.textContent === 'Remove')!.click()
    await flushPromises()
    expect(cells('Nuts')).toHaveLength(0)
  })

  it('ignores an empty food name', async () => {
    await mountConfig()
    await wrapper.get('#add-food-name').setValue('   ')
    await wrapper.get('#add-food-name').trigger('submit')
    expect(cells('Vegetables')).toHaveLength(7)
    expect(diet().findAll('[role="row"]')).toHaveLength(6)
  })

  it('adjusts a food goal with the stepper', async () => {
    await mountConfig()
    await diet().get('button[aria-label="Lower Fish goal"]').trigger('click')
    expect(diet().findAll('[data-testid="row-total"]')[2]!.text()).toBe('0 / 1')
  })

  it('adopts another tab’s diet changes', async () => {
    mountApp()
    const other = emptyState()
    other.diet.plans = { '2026-10-19': [{ id: 'q', name: 'Quinoa', target: 2 }] }
    const key = CACHE_PREFIX + USER
    localStorage.setItem(key, JSON.stringify(other))
    window.dispatchEvent(new StorageEvent('storage', { key, storageArea: localStorage }))
    await wrapper.vm.$nextTick()
    expect(
      diet()
        .findAll('[data-testid="item-name"]')
        .map((n) => n.text()),
    ).toEqual(['Quinoa'])
  })
})
