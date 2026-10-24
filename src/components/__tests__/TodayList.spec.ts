/**
 * The phone's first view (W12, brand spec K5): the TodayList card in
 * brand/design-system/project/components/TodayList, on its own and mounted in the real app below
 * the `sm` breakpoint, where it ticks through the same store actions as the week grid.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'
import TodayList from '@/components/TodayList.vue'
import { usePlannerStore } from '@/stores/planner'
import { useDietStore } from '@/stores/diet'
import { PHONE_QUERY, VIEW_KEY } from '@/composables/phoneView'
import { emptyState, signedIn } from '@/lib/__tests__/signedIn'
import type { SyncState } from '@/stores/sync'

// Friday 23 October 2026: today is the fifth day of the week of 19 October.
const NOW = new Date(2026, 9, 23, 18, 0)
const WEEK = '2026-10-19'
const TODAY = 4

describe('TodayList', () => {
  const props = {
    date: 'Thursday 22 October',
    pick: 3,
    exercises: [
      { id: 'pu', name: 'Push-ups', chips: ['3 × 12'], done: true, total: 3, target: 4 },
      { id: 'pl', name: 'Pull-ups', chips: ['3 × 5'], done: false, total: 1, target: 3 },
      { id: 'sq', name: 'Squats', chips: ['3 × 15', '16 kg'], done: true, total: 3, target: 3 },
    ],
    foods: [
      { id: 'veg', name: 'Vegetables', done: true, total: 5, target: 7 },
      { id: 'fish', name: 'Fish', done: false, total: 1, target: 2 },
    ],
  }

  it('heads the list with the date on the highlight band, "Today, " before it for a reader', () => {
    const wrapper = mount(TodayList, { props })
    const h1 = wrapper.get('h1')
    expect(h1.text()).toBe('Today, Thursday 22 October')
    expect(h1.get('.sr-only').text()).toBe('Today,')
    expect(h1.classes()).toContain('title-2')
    expect(wrapper.get('[data-testid="today-band"]').classes()).toContain('bg-highlight')
  })

  it('counts today’s exercises against the pick, in words', () => {
    const wrapper = mount(TodayList, { props })
    const summary = wrapper.get('[data-testid="today-summary"]')
    expect(summary.text()).toBe('Two of three. One to go.')
    expect(summary.classes()).toContain('body-large')
  })

  it('says how far over the pick, and leaves foods out of the count', async () => {
    const wrapper = mount(TodayList, { props })
    const four = [...props.exercises, { id: 'kh', name: 'Halos', done: true, total: 1, target: 2 }]
    await wrapper.setProps({ exercises: four.map((e) => ({ ...e, done: true })) })
    expect(wrapper.get('[data-testid="today-summary"]').text()).toBe('Four today, one extra.')
    await wrapper.setProps({ exercises: four.map((e) => ({ ...e, done: false })) })
    expect(wrapper.get('[data-testid="today-summary"]').text()).toBe('None yet. Three to go.')
  })

  it('lists exercises, then diet: the name, its chips, the week so far and one DayMark', () => {
    const wrapper = mount(TodayList, { props })
    const groups = wrapper.findAll('h2')
    expect(groups.map((h) => h.text())).toEqual(['Exercises', 'Food'])
    const squats = wrapper.findAll('li')[2]!
    expect(squats.get('[data-testid="item-name"]').text()).toBe('Squats')
    expect(squats.findAll('[data-testid="item-detail"]').map((c) => c.text())).toEqual([
      '3 × 15',
      '16 kg',
    ])
    expect(squats.get('[data-testid="item-week"]').text()).toBe('3 of 3 this week')
    const mark = squats.get('[data-slot="day-mark-button"]')
    expect(mark.attributes('aria-label')).toBe('Squats, Thursday 22 October, today')
    expect(mark.attributes('aria-pressed')).toBe('true')
    expect(mark.attributes('aria-current')).toBe('date')
    // Foods have no chips.
    const fish = wrapper.findAll('li').at(-1)!
    expect(fish.find('[data-testid="item-detail"]').exists()).toBe(false)
    expect(fish.get('[data-testid="item-week"]').text()).toBe('1 of 2 this week')
  })

  it('keeps its marks out of any grid, so the skip link and grid keys never mistake it', () => {
    const wrapper = mount(TodayList, { props })
    expect(wrapper.find('[role="grid"]').exists()).toBe(false)
    expect(wrapper.attributes('data-slot')).toBe('today-list')
  })

  it('emits a toggle with the kind and id from a mark, not from the row', async () => {
    const wrapper = mount(TodayList, { props })
    await wrapper.findAll('li')[1]!.trigger('click')
    expect(wrapper.emitted('toggle')).toBeUndefined()
    await wrapper.get('button[aria-label^="Pull-ups,"]').trigger('click')
    await wrapper.get('button[aria-label^="Fish,"]').trigger('click')
    expect(wrapper.emitted('toggle')).toEqual([
      ['exercise', 'pl'],
      ['food', 'fish'],
    ])
  })

  it('leaves out an empty group, and says so plainly when nothing is planned', async () => {
    const wrapper = mount(TodayList, { props: { ...props, exercises: [] } })
    expect(wrapper.findAll('h2').map((h) => h.text())).toEqual(['Food'])
    expect(wrapper.find('[data-testid="today-summary"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="today-empty"]').exists()).toBe(false)
    await wrapper.setProps({ foods: [] })
    expect(wrapper.findAll('h2')).toHaveLength(0)
    expect(wrapper.get('[data-testid="today-empty"]').text()).toBe(
      'Nothing is planned this week. Switch to Week and turn on Edit plan to add exercises and foods.',
    )
  })
})

describe('the phone’s Today view (K5)', () => {
  let wrapper: VueWrapper
  let listeners: ((ev: MediaQueryListEvent) => void)[]

  /** jsdom has no matchMedia: stand in for the phone query (and a light colour scheme). */
  function screen(phone: boolean): void {
    listeners = []
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === PHONE_QUERY ? phone : false,
      media: query,
      addEventListener: (_: string, fn: (ev: MediaQueryListEvent) => void) => {
        if (query === PHONE_QUERY) listeners.push(fn)
      },
      removeEventListener: (_: string, fn: (ev: MediaQueryListEvent) => void) =>
        (listeners = listeners.filter((l) => l !== fn)),
    }))
  }

  function mountApp(cache?: SyncState): VueWrapper {
    signedIn(cache)
    const pinia = createPinia()
    setActivePinia(pinia)
    wrapper = mount(App, { global: { plugins: [pinia] }, attachTo: document.body })
    return wrapper
  }

  const list = () => wrapper.find('[data-slot="today-list"]')
  const grids = () => wrapper.findAll('[role="grid"]')
  const viewSwitch = () => wrapper.get('[role="group"][aria-label="View"]')
  const segment = (name: string) =>
    viewSwitch()
      .findAll('button')
      .find((b) => b.text() === name)!
  const mark = (name: string) => list().get(`button[aria-label^="${name},"]`)

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

  it('opens on today below sm, with a Today | Week switch and no grid', () => {
    screen(true)
    mountApp()
    expect(list().exists()).toBe(true)
    expect(grids()).toHaveLength(0)
    expect(segment('Today').attributes('aria-pressed')).toBe('true')
    expect(segment('Week').attributes('aria-pressed')).toBe('false')
    // TodayList's heading is the page's one h1.
    expect(wrapper.findAll('h1').map((h) => h.text())).toEqual(['Today, Friday 23 October'])
  })

  it('shows only the week, with no switch, from sm up (and where matchMedia is missing)', () => {
    screen(false)
    mountApp()
    expect(list().exists()).toBe(false)
    expect(grids()).toHaveLength(2)
    expect(wrapper.find('[aria-label="View"]').exists()).toBe(false)
    wrapper.unmount()
    vi.unstubAllGlobals()
    mountApp()
    expect(list().exists()).toBe(false)
    expect(grids()).toHaveLength(2)
  })

  it('ticks today through the same store actions as the grid, and the week shows it', async () => {
    screen(true)
    mountApp()
    const planner = usePlannerStore()
    const diet = useDietStore()
    const toggle = vi.spyOn(planner, 'toggle')
    const eat = vi.spyOn(diet, 'toggle')
    await mark('Squats').trigger('click')
    await mark('Fish').trigger('click')
    expect(toggle).toHaveBeenCalledWith('sq', TODAY)
    expect(eat).toHaveBeenCalledWith('fish', TODAY)
    expect(mark('Squats').attributes('aria-pressed')).toBe('true')
    expect(planner.isDone('sq', TODAY)).toBe(true)
    expect(diet.isEaten('fish', TODAY)).toBe(true)

    await segment('Week').trigger('click')
    const today = (name: string) =>
      wrapper.get(`button[aria-label="${name}, Friday 23 October, today"]`)
    expect(today('Squats').attributes('aria-pressed')).toBe('true')
    expect(today('Fish').attributes('aria-pressed')).toBe('true')
  })

  it('counts the day in words as marks go on, past the pick', async () => {
    screen(true)
    const state = emptyState()
    const on = (day: number) => Array.from({ length: 7 }, (_, i) => i === day)
    state.exercise.log = { [WEEK]: { pu: on(TODAY), pl: on(TODAY) } }
    mountApp(state)
    const summary = () => list().get('[data-testid="today-summary"]').text()
    expect(summary()).toBe('Two of three. One to go.')
    await mark('Squats').trigger('click')
    expect(summary()).toBe('Three of three.')
    await mark('Back extensions').trigger('click')
    expect(summary()).toBe('Four today, one extra.')
  })

  it('remembers the chosen view on this device', async () => {
    screen(true)
    mountApp()
    await segment('Week').trigger('click')
    expect(list().exists()).toBe(false)
    expect(grids()).toHaveLength(2)
    expect(JSON.parse(localStorage.getItem(VIEW_KEY)!)).toBe('week')
    wrapper.unmount()
    mountApp()
    expect(segment('Week').attributes('aria-pressed')).toBe('true')
    expect(grids()).toHaveLength(2)
    await segment('Today').trigger('click')
    expect(list().exists()).toBe(true)
    expect(JSON.parse(localStorage.getItem(VIEW_KEY)!)).toBe('today')
  })

  it('ignores a stored view it doesn’t know, and opens on Today', () => {
    screen(true)
    localStorage.setItem(VIEW_KEY, '"month"')
    mountApp()
    expect(list().exists()).toBe(true)
  })

  it('follows the screen across the breakpoint, and stops listening when it goes', async () => {
    screen(false)
    mountApp()
    expect(list().exists()).toBe(false)
    listeners.forEach((fn) => fn({ matches: true } as MediaQueryListEvent))
    await flushPromises()
    expect(list().exists()).toBe(true)
    wrapper.unmount()
    expect(listeners).toHaveLength(0)
  })

  it('shows the week for another week, and Today brings back this week', async () => {
    screen(true)
    mountApp()
    await wrapper.get('button[aria-label="Previous week"]').trigger('click')
    expect(list().exists()).toBe(false)
    expect(segment('Week').attributes('aria-pressed')).toBe('true')
    await segment('Today').trigger('click')
    expect(usePlannerStore().weekKey).toBe(WEEK)
    expect(list().exists()).toBe(true)
  })

  it('edits the plan in the Week view only: Edit plan shows the week, Today turns it off', async () => {
    screen(true)
    mountApp()
    await wrapper.get('button[role="switch"]').trigger('click')
    expect(list().exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Remove Squats"]').exists()).toBe(true)
    await segment('Today').trigger('click')
    expect(usePlannerStore().configMode).toBe(false)
    expect(list().exists()).toBe(true)
  })

  it('skips to today’s first mark in the list when the list is showing', async () => {
    screen(true)
    mountApp()
    await wrapper.get('a[data-testid="skip-to-today"]').trigger('click')
    expect(document.activeElement?.getAttribute('aria-label')).toBe(
      'Push-ups, Friday 23 October, today',
    )
    expect(list().element.contains(document.activeElement)).toBe(true)
  })
})
