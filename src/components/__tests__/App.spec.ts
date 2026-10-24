import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'
import { usePlannerStore } from '@/stores/planner'
import { SESSION_KEY } from '@/stores/session'
import { CACHE_PREFIX, type SyncState } from '@/stores/sync'
import { readFixture } from '@/lib/__tests__/fixtures'
import type { FakeApi } from '@/lib/__tests__/fakeApi'
import { USER, cached, emptyState, signedIn } from '@/lib/__tests__/signedIn'

const NOW = new Date(2026, 9, 23, 18, 0)

let wrapper: VueWrapper
let api: FakeApi

afterEach(() => vi.unstubAllGlobals())

/** Mount the app signed in as alice, with `cache` as her data on this device. */
function mountApp(cache?: SyncState): VueWrapper {
  api = signedIn(cache)
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

/** The exercise grid only; the diet grid below reuses the same markup. */
function ex() {
  return wrapper.get('[data-testid="exercise-grid"]')
}

function rowCells(name: string) {
  return wrapper.findAll(`button[aria-label^="${name},"]`)
}

/** The pen the app applied: the chosen ink's light and dark values. */
function pen(): [string, string] {
  const style = document.documentElement.style
  return [style.getPropertyValue('--user-pen-light'), style.getPropertyValue('--user-pen-dark')]
}
const VIOLET: [string, string] = ['#4b3b7a', '#b9a9e8']
const INK_BLUE: [string, string] = ['#2b4c7e', '#9db8e8']

/** The open dialog, by role: Reka renders it in a portal on document.body, outside the wrapper. */
function dialog(): DOMWrapper<HTMLElement> | null {
  const el = document.querySelector<HTMLElement>('[role="dialog"]')
  return el ? new DOMWrapper(el) : null
}

/** Lets Reka's queued work (focus-outside checks, presence, nextTick chains) settle. */
async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++) await new Promise((resolve) => setTimeout(resolve, 0))
}

/** The open ConfirmDialog, by role; Reka renders it in a portal on document.body. */
function confirmation(): DOMWrapper<HTMLElement> | null {
  const el = document.querySelector<HTMLElement>('[role="alertdialog"]')
  return el ? new DOMWrapper(el) : null
}

/** Answer the open ConfirmDialog with the button of this name ("Cancel", "Remove"…). */
async function answer(name: string): Promise<void> {
  await confirmation()!
    .findAll('button')
    .find((b) => b.text() === name)!
    .trigger('click')
  await settle()
}

/** The Settings IconButton in the Header, and opening the popover from it. */
function settingsButton() {
  return wrapper.get('button[aria-label="Settings"]')
}
async function openSettings(): Promise<void> {
  await settingsButton().trigger('click')
  await settle()
}

/** The Settings popover's panel: a dialog (Reka Popover), rendered in place after the button. */
const PANEL = '[role="dialog"][data-slot="popover-content"]'

/** An ink in the InkPicker: a radio named by its visible name. */
function inkRadio(name: string) {
  return wrapper.findAll('[role="radio"]').find((r) => r.text() === name)!
}

/** The daily pick as the Settings Stepper shows it. */
function dailyPick(): string | undefined {
  return wrapper.get(PANEL).get('[role="spinbutton"]').attributes('aria-valuenow')
}

/** Press an exercise's Edit button and return its dialog, once Reka has opened it. */
async function openEdit(name: string): Promise<DOMWrapper<HTMLElement>> {
  await wrapper.get(`button[aria-label="Edit ${name}"]`).trigger('click')
  await flushPromises()
  return dialog()!
}

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    localStorage.clear()
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders the week label, the default rows and the reps chips', () => {
    mountApp()
    expect(wrapper.find('h1').text()).toBe('19–25 October')
    expect(
      ex()
        .findAll('[data-testid="item-name"]')
        .map((n) => n.text()),
    ).toEqual(['Push-ups', 'Pull-ups', 'Squats', 'Back extensions', 'Kettlebell halos'])
    const chips = wrapper.findAll('[data-testid="item-detail"]').map((c) => c.text())
    expect(chips[0]).toBe('10 reps a set')
    expect(chips[4]).toBe('8 each side')
  })

  it('marks today’s column in the header and the cells', () => {
    mountApp()
    const heads = ex().findAll('[data-testid="day-head"]')
    expect(heads.map((h) => h.attributes('data-today') === 'true')).toEqual([
      false,
      false,
      false,
      false,
      true,
      false,
      false,
    ])
    expect(rowCells('Squats')[4]!.element.parentElement!.getAttribute('data-today')).toBe('true')
  })

  it('toggles a cell with aria-pressed and updates totals and footer counts', async () => {
    mountApp()
    const cell = rowCells('Push-ups')[1]!
    expect(cell.attributes('aria-pressed')).toBe('false')
    await cell.trigger('click')
    expect(cell.attributes('aria-pressed')).toBe('true')
    expect(cell.find('[data-on="true"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="grand-total"]').text()).toBe('1 of 18 this week')
    expect(ex().findAll('[data-testid="day-count"]')[1]!.text()).toBe('1')
    expect(ex().findAll('[data-testid="row-total"]')[0]!.text()).toBe('1 of 4')
  })

  it('colours the footer count by whether the daily pick is met, exceeded or not', async () => {
    mountApp()
    const counts = () => ex().findAll('[data-testid="day-count"]')
    for (const name of ['Push-ups', 'Pull-ups', 'Squats']) await rowCells(name)[0]!.trigger('click')
    expect(counts()[0]!.attributes('data-tone')).toBe('met')
    await rowCells('Kettlebell halos')[0]!.trigger('click')
    expect(counts()[0]!.attributes('data-tone')).toBe('over')
    expect(counts()[1]!.attributes('data-tone')).toBe('under')
  })

  it('highlights the row total once the goal is reached, and steps the goal', async () => {
    await mountConfig()
    const total = () => ex().findAll('[data-testid="row-total"]')[3]!
    await rowCells('Back extensions')[0]!.trigger('click')
    expect(total().attributes('data-met')).toBe('false')
    const lower = wrapper.get('button[aria-label="Lower Back extensions goal"]')
    await lower.trigger('click')
    await lower.trigger('click')
    expect(total().text()).toBe('1 of 1')
    expect(total().attributes('data-met')).toBe('true')
    await lower.trigger('click')
    expect(total().text()).toBe('1 of 0')
    expect(total().attributes('data-met')).toBe('false')
    expect(lower.attributes('aria-disabled')).toBe('true')
    await lower.trigger('click')
    expect(total().text()).toBe('1 of 0')
    await wrapper.get('button[aria-label="Raise Back extensions goal"]').trigger('click')
    expect(total().text()).toBe('1 of 1')
  })

  it('takes a typed goal, and leaves the plan alone when the goal does not change', async () => {
    await mountConfig()
    const goal = ex().get('[role="spinbutton"][aria-valuenow="4"]')
    expect(document.getElementById(goal.attributes('aria-labelledby')!)!.textContent!.trim()).toBe(
      'Push-ups goal',
    )
    await goal.setValue('6')
    await goal.trigger('keydown', { key: 'Enter' })
    await flushPromises()
    expect(ex().findAll('[data-testid="row-total"]')[0]!.text()).toBe('0 of 6')
    const plans = () => JSON.stringify(usePlannerStore().plans)
    const before = plans()
    await goal.setValue('6')
    await goal.trigger('keydown', { key: 'Enter' })
    await flushPromises()
    expect(plans()).toBe(before)
  })

  it('navigates weeks and returns to this week', async () => {
    mountApp()
    const thisWeek = () => wrapper.findAll('button').find((b) => b.text() === 'This week')
    // "This week" shows only while another week is on screen (Header card).
    expect(thisWeek()).toBeUndefined()
    expect(wrapper.get('[data-testid="week-label"]').text()).toBe('19–25 October')
    await wrapper.get('button[aria-label="Previous week"]').trigger('click')
    expect(wrapper.find('h1').text()).toBe('12–18 October')
    expect(wrapper.get('[data-testid="week-label"]').text()).toBe('12–18 October')
    await wrapper.get('button[aria-label="Next week"]').trigger('click')
    await wrapper.get('button[aria-label="Next week"]').trigger('click')
    expect(wrapper.find('h1').text()).toBe('26 Oct – 1 Nov')
    expect(wrapper.get('[data-testid="week-label"]').text()).toBe('26 Oct – 1 Nov')
    await thisWeek()!.trigger('click')
    expect(wrapper.find('h1').text()).toBe('19–25 October')
    expect(thisWeek()).toBeUndefined()
  })

  it('removes an exercise only after confirmation', async () => {
    await mountConfig()
    const remove = wrapper.get('button[aria-label="Remove Squats"]')
    await remove.trigger('click')
    await settle()
    expect(confirmation()!.get('h2').text()).toBe('Remove Squats?')
    expect(confirmation()!.text()).toContain(
      'It comes off this week’s plan. Weeks with their own plan keep it, and its marks stay.',
    )
    await answer('Cancel')
    expect(confirmation()).toBeNull()
    expect(rowCells('Squats')).toHaveLength(7)
    await remove.trigger('click')
    await settle()
    await answer('Remove')
    expect(rowCells('Squats')).toHaveLength(0)
  })

  it('prints via window.print', async () => {
    mountApp()
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Print…')!
      .trigger('click')
    expect(print).toHaveBeenCalledOnce()
  })

  it('refreshes today when the tab becomes visible again', () => {
    mountApp()
    const store = usePlannerStore()
    vi.setSystemTime(new Date(2026, 9, 24, 0, 5))
    document.dispatchEvent(new Event('visibilitychange'))
    expect(store.days.findIndex((d) => d.isToday)).toBe(5)
  })

  it('moves today at midnight in a tab that stays visible', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] })
    vi.setSystemTime(NOW)
    mountApp()
    const store = usePlannerStore()
    vi.setSystemTime(new Date(2026, 9, 24, 0, 0, 30))
    vi.advanceTimersByTime(60_000)
    expect(store.days.findIndex((d) => d.isToday)).toBe(5)
  })

  it('adopts changes another tab writes to the cache', async () => {
    mountApp()
    const other = emptyState()
    other.exercise.plans = {
      '2026-10-19': [{ id: 'a', name: 'From other tab', reps: 5, target: 2 }],
    }
    other.exercise.log = { '2026-10-19': { a: [true, false, false, false, false, false, false] } }
    otherTabWrites(other)
    await wrapper.vm.$nextTick()
    expect(
      ex()
        .findAll('[data-testid="item-name"]')
        .map((n) => n.text()),
    ).toEqual(['From other tab'])
    expect(wrapper.get('[data-testid="grand-total"]').text()).toBe('1 of 2 this week')
  })
})

/** Another tab saved `state` to alice's cache. */
function otherTabWrites(state: SyncState): void {
  const key = CACHE_PREFIX + USER
  localStorage.setItem(key, JSON.stringify(state))
  window.dispatchEvent(new StorageEvent('storage', { key, storageArea: localStorage }))
}

describe('AddExerciseForm', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => wrapper?.unmount())

  it('adds an exercise on submit, keeping only digits in reps, then resets', async () => {
    await mountConfig()
    await wrapper.get('#add-exercise-name').setValue('Lunges')
    const reps = wrapper.get('#add-exercise-reps')
    await reps.setValue('1a2')
    expect((reps.element as HTMLInputElement).value).toBe('12')
    await wrapper
      .findAll('button[aria-pressed]')
      .find((b) => b.text() === 'Each side')!
      .trigger('click')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.findAll('[data-testid="item-detail"]').at(-1)!.text()).toBe('12 each side')
    expect(ex().findAll('[data-testid="row-total"]').at(-1)!.text()).toBe('0 of 3')
    expect((wrapper.get('#add-exercise-name').element as HTMLInputElement).value).toBe('')
    expect((reps.element as HTMLInputElement).value).toBe('')
    const perSet = wrapper.findAll('button[aria-pressed]').find((b) => b.text() === 'Per set')!
    expect(perSet.attributes('aria-pressed')).toBe('true')
  })

  it('labels every field of the add forms visibly, not by placeholder (F17)', async () => {
    await mountConfig()
    const labelFor = (id: string) => wrapper.find(`label[for="${id}"]`)
    const inputs = wrapper.findAll('form[data-noprint] input')
    expect(inputs.map((i) => i.attributes('id'))).toEqual([
      'add-exercise-name',
      'add-exercise-sets',
      'add-exercise-reps',
      'add-exercise-weight',
      'add-food-name',
    ])
    expect(inputs.map((i) => labelFor(i.attributes('id')!).text())).toEqual([
      'New exercise',
      'Sets',
      'Reps',
      'Weight in kg',
      'New food',
    ])
    for (const input of inputs) expect(input.attributes('aria-label')).toBeUndefined()
    const group = wrapper.get('form[data-noprint] [role="group"]')
    expect(wrapper.get(`#${group.attributes('aria-labelledby')}`).text()).toBe('Reps count')
  })

  it('does nothing for an empty name', async () => {
    await mountConfig()
    await wrapper.get('#add-exercise-name').setValue('   ')
    await wrapper.get('form').trigger('submit')
    expect(ex().findAll('[data-testid="item-name"]')).toHaveLength(5)
  })

  it('shows no chip, not a dash, when no reps are given', async () => {
    await mountConfig()
    await wrapper.get('#add-exercise-name').setValue('Plank')
    await wrapper.get('form').trigger('submit')
    const plank = ex().findAll('tbody tr').at(-1)!
    expect(plank.get('[data-testid="item-name"]').text()).toBe('Plank')
    expect(plank.findAll('[data-testid="item-detail"]')).toHaveLength(0)
  })
})

describe('SettingsPopover', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => wrapper?.unmount())

  it('opens, changes the ink and daily pick live, and closes on Escape', async () => {
    mountApp()
    expect(wrapper.find(PANEL).exists()).toBe(false)
    await openSettings()
    expect(settingsButton().attributes('aria-expanded')).toBe('true')
    expect(wrapper.get(PANEL).get('h2').text()).toBe('Settings')
    // Nothing saved yet: Ink blue, although the stored default accent is the old green.
    expect(inkRadio('Ink blue').attributes('aria-checked')).toBe('true')
    expect(pen()).toEqual(INK_BLUE)

    await inkRadio('Violet').trigger('click')
    expect(inkRadio('Violet').attributes('aria-checked')).toBe('true')
    expect(inkRadio('Ink blue').attributes('aria-checked')).toBe('false')
    expect(usePlannerStore().accent).toBe('#4b3b7a')
    expect(pen()).toEqual(VIOLET)

    await wrapper.get('button[aria-label="More exercises a day"]').trigger('click')
    expect(dailyPick()).toBe('4')
    expect(ex().get('tfoot [role="rowheader"]').text()).toBe('Picked4 a day')
    expect(ex().findAll('[data-testid="day-count"]')[0]!.text()).toBe('0')

    const violet = inkRadio('Violet').element as HTMLElement
    violet.focus()
    violet.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await settle()
    expect(wrapper.find(PANEL).exists()).toBe(false)
    expect(document.activeElement).toBe(settingsButton().element)
  })

  it('closes when Tab moves focus out of it, onto the next control on the page (F14)', async () => {
    mountApp()
    await openSettings()
    const panel = document.getElementById(settingsButton().attributes('aria-controls')!)!
    const tabbable = [
      ...document.querySelectorAll<HTMLElement>('button, input, [tabindex="0"]'),
    ].filter((el) => !el.hasAttribute('disabled'))
    const last = tabbable.filter((el) => panel.contains(el)).at(-1)!
    // The first control after the panel in the page's order: where Tab goes from its last one.
    const next = tabbable.find(
      (el) =>
        !panel.contains(el) && panel.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING,
    )!
    last.focus()
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    last.dispatchEvent(tab)
    if (!tab.defaultPrevented) next.focus()
    await settle()
    expect(settingsButton().attributes('aria-expanded')).toBe('false')
    expect(wrapper.find(PANEL).exists()).toBe(false)
    // Focus stays where Tab sent it: the next control in the Header, not back in the panel.
    expect(document.activeElement).toBe(next)
    expect(next.textContent).toBe('Print…')
  })

  it('closes on an outside pointerdown but not on one inside', async () => {
    mountApp()
    await openSettings()
    const press = () => new PointerEvent('pointerdown', { bubbles: true, button: 0 })
    wrapper.get(PANEL).get('h2').element.dispatchEvent(press())
    await settle()
    expect(wrapper.find(PANEL).exists()).toBe(true)
    document.body.dispatchEvent(press())
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await settle()
    expect(wrapper.find(PANEL).exists()).toBe(false)
  })

  it('disables the daily-pick buttons at the 1–8 bounds', async () => {
    mountApp()
    await openSettings()
    const fewer = wrapper.get('button[aria-label="Fewer exercises a day"]')
    await fewer.trigger('click')
    await fewer.trigger('click')
    expect(fewer.attributes('aria-disabled')).toBe('true')
    await fewer.trigger('click')
    expect(dailyPick()).toBe('1')
    expect(usePlannerStore().dailyPick).toBe(1)
    const more = wrapper.get('button[aria-label="More exercises a day"]')
    for (let i = 0; i < 8; i++) await more.trigger('click')
    expect(more.attributes('aria-disabled')).toBe('true')
    expect(dailyPick()).toBe('8')
  })

  /** Mount with these settings saved on the server as well as cached, so loading keeps them. */
  function mountWithSettings(settings: { accent: string; dailyPick: number }): void {
    api = signedIn({ ...emptyState(), settings })
    api.accounts.get(USER)!.settings = settings
    const pinia = createPinia()
    setActivePinia(pinia)
    wrapper = mount(App, { global: { plugins: [pinia] }, attachTo: document.body })
  }

  it('shows a saved legacy accent as its ink, without rewriting it', async () => {
    mountWithSettings({ accent: '#ff9f0a', dailyPick: 3 })
    await openSettings()
    // Orange was too close to the over-the-pick colour, so it becomes Ink blue (K3).
    expect(inkRadio('Ink blue').attributes('aria-checked')).toBe('true')
    expect(pen()).toEqual(INK_BLUE)
    expect(usePlannerStore().accent).toBe('#ff9f0a')
    wrapper.unmount()

    mountWithSettings({ accent: '#30d158', dailyPick: 3 })
    await openSettings()
    expect(inkRadio('Forest').attributes('aria-checked')).toBe('true')
    expect(pen()).toEqual(['#2f5d46', '#8fcbaa'])
  })
})

describe('export and import', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    localStorage.clear()
  })
  afterEach(() => {
    wrapper?.unmount()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const EXPORT = {
    format: 'fitness-planner-export',
    version: 1,
    exercise: {
      plans: {
        '2026-10-12': [{ id: 'sq', name: 'Squats', reps: 15, target: 4 }],
        '2026-10-19': [{ id: 'sq', name: 'Squats', reps: 15, target: 4 }],
      },
      log: { '2026-10-19': { sq: [true, true, false, false, false, false, false] } },
    },
    diet: {
      plans: { '2026-10-19': [{ id: 'eggs', name: 'Eggs', target: 2 }] },
      log: { '2026-10-19': { eggs: [false, false, true, false, false, false, false] } },
    },
    settings: { accent: '#bf5af2', dailyPick: 2 },
  }

  function button(name: string) {
    return wrapper.findAll('button').find((b) => b.text() === name)!
  }

  /** jsdom cannot open a file picker; hand the input a file and fire `change`. */
  async function choose(file: File): Promise<void> {
    const input = wrapper.get('[data-testid="import-file"]')
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await flushPromises()
  }

  function jsonFile(data: unknown): File {
    return new File([JSON.stringify(data)], 'export.json', { type: 'application/json' })
  }

  it('exports the plans, ticks and settings as a dated JSON file', async () => {
    let blob: Blob | undefined
    URL.createObjectURL = vi.fn<(b: Blob) => string>((b) => {
      blob = b
      return 'blob:x'
    })
    URL.revokeObjectURL = vi.fn<(url: string) => void>()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    mountApp()
    await rowCells('Squats')[2]!.trigger('click')
    await openSettings()
    await button('Export').trigger('click')
    expect(click).toHaveBeenCalledOnce()
    expect((click.mock.contexts[0] as HTMLAnchorElement).download).toBe(
      'fitness-planner-2026-10-23.json',
    )
    const file = JSON.parse(await blob!.text())
    expect(file).toMatchObject({
      format: 'fitness-planner-export',
      version: 1,
      settings: { accent: '#30d158', dailyPick: 3 },
    })
    expect(file.settings).not.toHaveProperty('theme')
    expect(file.exercise.log['2026-10-19'].sq[2]).toBe(true)
    expect(file.diet).toEqual({ plans: {}, log: {} })
  })

  it('opens the file picker from Import…', async () => {
    mountApp()
    await openSettings()
    const picker = vi.spyOn(
      wrapper.get('[data-testid="import-file"]').element as HTMLInputElement,
      'click',
    )
    await button('Import…').trigger('click')
    expect(picker).toHaveBeenCalledOnce()
  })

  it('summarises what a file adds, then merges it on Import', async () => {
    mountApp()
    await rowCells('Push-ups')[4]!.trigger('click')
    await openSettings()
    await inkRadio('Ink blue').trigger('click')
    await choose(jsonFile(EXPORT))
    // The tick gave this week its own plan, so only last week's exercise plan and this week's food
    // plan are new. Picking Ink blue saved settings, so the file's accent and daily pick don't apply.
    expect(wrapper.get('[data-testid="import-summary"]').text()).toBe(
      'Adds two weekly plans and three ticks. Existing plans and ticks stay as they are.',
    )
    expect(rowCells('Squats')[0]!.attributes('aria-pressed')).toBe('false')

    await button('Import').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="status"]').text()).toBe('Imported.')
    expect(wrapper.find('[data-testid="import-summary"]').exists()).toBe(false)
    expect(rowCells('Squats')[0]!.attributes('aria-pressed')).toBe('true')
    expect(rowCells('Push-ups')[4]!.attributes('aria-pressed')).toBe('true')
    expect(rowCells('Eggs')[2]!.attributes('aria-pressed')).toBe('true')
    expect(pen()).toEqual(INK_BLUE)
  })

  it('applies the file’s settings when this browser has none saved', async () => {
    mountApp()
    await openSettings()
    await choose(jsonFile(EXPORT))
    expect(wrapper.get('[data-testid="import-summary"]').text()).toBe(
      'Adds three weekly plans and three ticks, plus the ink and the number of exercises a day. Existing plans and ticks stay as they are.',
    )
    await button('Import').trigger('click')
    await flushPromises()
    expect(pen()).toEqual(VIOLET)
    expect(dailyPick()).toBe('2')
  })

  it('uses the singular for one plan and one tick', async () => {
    mountApp()
    await openSettings()
    await inkRadio('Ink blue').trigger('click')
    await choose(
      jsonFile({
        format: 'fitness-planner-export',
        version: 1,
        exercise: {
          plans: { '2026-10-12': [] },
          log: { '2026-10-19': { pu: [true, false, false, false, false, false, false] } },
        },
      }),
    )
    expect(wrapper.get('[data-testid="import-summary"]').text()).toBe(
      'Adds one weekly plan and one tick. Existing plans and ticks stay as they are.',
    )
  })

  it('keeps the summary true when settings change while it is open', async () => {
    mountApp()
    await openSettings()
    await choose(jsonFile(EXPORT))
    expect(wrapper.get('[data-testid="import-summary"]').text()).toContain('plus the ink')
    await inkRadio('Ink blue').trigger('click')
    expect(wrapper.get('[data-testid="import-summary"]').text()).not.toContain('plus the ink')
    await button('Import').trigger('click')
    await flushPromises()
    expect(pen()).toEqual(INK_BLUE)
  })

  it('says so, and keeps the file, when the server cannot be reached', async () => {
    mountApp()
    await openSettings()
    await choose(jsonFile(EXPORT))
    api.offline = true
    await button('Import').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe(
      'Can’t reach the server, so nothing was imported. Try again when you’re online.',
    )
    expect(wrapper.find('[data-testid="import-summary"]').exists()).toBe(true)
    api.offline = false
    const before = api.paths('POST /import').length // the attempt made while offline
    const release = api.hold()
    await button('Import').trigger('click')
    await button('Import').trigger('click') // a second press while the first is under way
    release()
    await flushPromises()
    expect(api.paths('POST /import')).toHaveLength(before + 1)
    expect(wrapper.get('[role="status"]').text()).toBe('Imported.')
  })

  it('discards the file on Cancel', async () => {
    mountApp()
    await openSettings()
    await choose(jsonFile(EXPORT))
    await button('Cancel').trigger('click')
    expect(wrapper.find('[data-testid="import-summary"]').exists()).toBe(false)
    expect(rowCells('Squats')[0]!.attributes('aria-pressed')).toBe('false')
    expect(localStorage.getItem('fitness-planner-v2')).toBeNull()
  })

  it('says so when the file adds nothing', async () => {
    mountApp()
    await openSettings()
    await choose(jsonFile({ format: 'fitness-planner-export', version: 1 }))
    expect(wrapper.get('[role="status"]').text()).toBe(
      'Nothing new: everything in that file is already here.',
    )
    expect(wrapper.find('[data-testid="import-summary"]').exists()).toBe(false)
  })

  it.each([
    ['not JSON', new File(['{oops'], 'x.json'), 'That file isn’t valid JSON.'],
    ['another format', jsonFile({ plans: {} }), 'That file isn’t a Fitness Planner export.'],
    [
      'a newer version',
      jsonFile({ format: 'fitness-planner-export', version: 2 }),
      'That export comes from a newer version of the app.',
    ],
  ])('rejects %s with an inline error and changes nothing', async (_, file, message) => {
    mountApp()
    await flushPromises()
    const before = { ...localStorage }
    await openSettings()
    await choose(file)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toBe(message)
    expect(alert.attributes('data-tone')).toBe('error')
    expect({ ...localStorage }).toEqual(before)
  })

  it('reports a file that cannot be read', async () => {
    mountApp()
    await openSettings()
    const file = jsonFile(EXPORT)
    vi.spyOn(file, 'text').mockRejectedValue(new Error('gone'))
    await choose(file)
    expect(wrapper.get('[role="alert"]').text()).toBe('That file couldn’t be read.')
  })

  it('ignores a change with no file, and clears the outcome when reopened', async () => {
    mountApp()
    await openSettings()
    await wrapper.get('[data-testid="import-file"]').trigger('change')
    await flushPromises()
    expect(wrapper.find('[role="alert"], [role="status"]').exists()).toBe(false)
    await choose(new File(['{oops'], 'x.json'))
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    await openSettings()
    await openSettings()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })
})

describe('export and import with the sample data', () => {
  // Four weeks of edited plans, ticks and diet over a five-week span, plus non-default settings
  // (fixtures/transfer/sample/).
  const storage = readFixture<Record<string, unknown>>('sample/storage.json')
  const sample = readFixture<Record<string, unknown>>('sample/export.json')

  type Tracked = { plans: object; log: object }
  const exercise = storage['fitness-planner-v2'] as Tracked
  const diet = storage['fitness-planner-diet-v2'] as Tracked
  const { accent, dailyPick } = storage['fitness-planner-settings-v1'] as {
    accent: string
    dailyPick: number
  }

  /** The sample as alice's cache: the same data, as the sync store keeps it. */
  function sampleCache(): SyncState {
    return {
      exercise: { ...exercise, revs: {} },
      diet: { ...diet, revs: {} },
      settings: { accent, dailyPick },
    } as SyncState
  }

  function button(name: string) {
    return wrapper.findAll('button').find((b) => b.text() === name)!
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    localStorage.clear()
  })
  afterEach(() => {
    wrapper?.unmount()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('exports the sample storage as the sample export file', async () => {
    let blob: Blob | undefined
    URL.createObjectURL = vi.fn<(b: Blob) => string>((b) => {
      blob = b
      return 'blob:sample'
    })
    URL.revokeObjectURL = vi.fn<(url: string) => void>()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    api = signedIn(sampleCache())
    api.stall('GET', '/state') // show the cache, as the browser does before the server answers
    const pinia = createPinia()
    setActivePinia(pinia)
    wrapper = mount(App, { global: { plugins: [pinia] }, attachTo: document.body })
    // The seeded week shows its edited plan, so the app really loaded the sample.
    expect(
      ex()
        .findAll('[data-testid="item-name"]')
        .map((n) => n.text()),
    ).toEqual(['Push-ups', 'Pull-ups', 'Squats', 'Kettlebell halos', 'Plank'])
    await openSettings()
    await button('Export').trigger('click')
    expect(JSON.parse(await blob!.text())).toEqual({ ...sample, exportedAt: NOW.toISOString() })
  })

  it('imports the sample export into an empty account and syncs all of it', async () => {
    mountApp()
    await flushPromises()
    await openSettings()
    const input = wrapper.get('[data-testid="import-file"]')
    const file = new File([JSON.stringify(sample)], 'sample.json', { type: 'application/json' })
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')
    await flushPromises()
    expect(wrapper.get('[data-testid="import-summary"]').text()).toBe(
      'Adds six weekly plans and 102 ticks, plus the ink and the number of exercises a day. Existing plans and ticks stay as they are.',
    )
    await button('Import').trigger('click')
    await flushPromises()
    const { revs: _e, ...cachedExercise } = cached().exercise
    const { revs: _d, ...cachedDiet } = cached().diet
    expect(cachedExercise).toEqual(exercise)
    expect(cachedDiet).toEqual(diet)
    expect(cached().settings).toEqual({ accent, dailyPick })
    // Every plan and tick reached the server too.
    const server = api.state(USER) as SyncState
    expect({ plans: server.exercise.plans, log: server.exercise.log }).toEqual(exercise)
    expect({ plans: server.diet.plans, log: server.diet.log }).toMatchObject(diet)
    expect(server.settings).toEqual({ accent, dailyPick })
    // The theme is per device, so it never left this browser.
    expect(localStorage.getItem('fitness-planner-settings-v1')).toBeNull()
  })
})

describe('theme', () => {
  let listeners: ((ev: MediaQueryListEvent) => void)[]

  /** jsdom has no matchMedia, so stand in for the OS colour-scheme query. */
  function fakeColorScheme(dark: boolean): void {
    listeners = []
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: dark,
      media: query,
      addEventListener: (_: string, fn: (ev: MediaQueryListEvent) => void) => listeners.push(fn),
      removeEventListener: (_: string, fn: (ev: MediaQueryListEvent) => void) =>
        (listeners = listeners.filter((l) => l !== fn)),
    }))
  }

  function isDarkClass(): boolean {
    return document.documentElement.classList.contains('dark')
  }

  beforeEach(() => localStorage.clear())
  afterEach(() => {
    wrapper?.unmount()
    vi.unstubAllGlobals()
    document.documentElement.classList.remove('dark')
  })

  it('follows the OS setting by default, including later changes', async () => {
    fakeColorScheme(true)
    mountApp()
    expect(isDarkClass()).toBe(true)
    listeners.forEach((fn) => fn({ matches: false } as MediaQueryListEvent))
    await wrapper.vm.$nextTick()
    expect(isDarkClass()).toBe(false)
    wrapper.unmount()
    expect(listeners).toHaveLength(0)
  })

  it('switches theme from the settings panel and remembers it', async () => {
    fakeColorScheme(false)
    mountApp()
    expect(isDarkClass()).toBe(false)
    await openSettings()
    const themeButton = (name: string) =>
      wrapper
        .get(PANEL)
        .findAll('[role="group"] button[aria-pressed]')
        .find((b) => b.text() === name)!

    expect(themeButton('System').attributes('aria-pressed')).toBe('true')
    await themeButton('Dark').trigger('click')
    expect(isDarkClass()).toBe(true)
    expect(themeButton('Dark').attributes('aria-pressed')).toBe('true')
    expect(JSON.parse(localStorage.getItem('fitness-planner-settings-v1')!).theme).toBe('dark')

    await themeButton('Light').trigger('click')
    expect(isDarkClass()).toBe(false)
  })

  it('treats System as light where matchMedia is unavailable', () => {
    mountApp()
    expect(isDarkClass()).toBe(false)
  })
})

describe('exercise weight', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => wrapper?.unmount())

  function detail(name: string) {
    const row = ex()
      .findAll('[role="rowheader"]')
      .find((r) => r.get('[data-testid="item-name"]').text() === name)!
    return row
      .findAll('[data-testid="item-detail"]')
      .map((c) => c.text())
      .join(' · ')
  }

  it('adds an exercise with a weight, accepting a comma decimal', async () => {
    await mountConfig()
    await wrapper.get('#add-exercise-name').setValue('Swings')
    await wrapper.get('#add-exercise-reps').setValue('20')
    const weight = wrapper.get('#add-exercise-weight')
    await weight.setValue('16,5kg')
    expect((weight.element as HTMLInputElement).value).toBe('16.5')
    await wrapper.get('form').trigger('submit')
    expect(detail('Swings')).toBe('20 reps a set · 16.5 kg')
    expect((weight.element as HTMLInputElement).value).toBe('')
  })

  it('edits an existing exercise in a dialog', async () => {
    await mountConfig()
    expect(dialog()).toBeNull()
    const edit = await openEdit('Squats')
    expect(edit.attributes('aria-modal')).toBe('true')
    expect(document.getElementById(edit.attributes('aria-labelledby')!)!.textContent).toBe(
      'Edit exercise',
    )
    expect(document.activeElement).toBe(edit.get('#edit-exercise-name').element)
    expect((edit.get('input[data-field="reps"]').element as HTMLInputElement).value).toBe('15')

    await edit.get('#edit-exercise-weight').setValue('12')
    await edit.get('form').trigger('submit')
    await flushPromises()
    expect(dialog()).toBeNull()
    expect(detail('Squats')).toBe('15 reps a set · 12 kg')
  })

  it('labels every field in the dialog, and saves from the button outside the form', async () => {
    await mountConfig()
    const edit = await openEdit('Squats')
    const labels = edit
      .findAll('input')
      .map((i) => edit.get(`label[for="${i.attributes('id')}"]`).text())
    expect(labels).toEqual(['Name', 'Sets', 'Reps', 'Weight in kg'])
    // Optional fields say so in their hint, as in the add form.
    const sets = edit.get('#edit-exercise-sets')
    expect(edit.get(`#${sets.attributes('aria-describedby')}`).text()).toBe('Optional.')
    const save = edit.findAll('button').find((b) => b.text() === 'Save')!
    expect(save.attributes('type')).toBe('submit')
    expect(save.attributes('form')).toBe(edit.get('form').attributes('id'))
  })

  it('discards changes on Cancel', async () => {
    await mountConfig()
    const edit = await openEdit('Squats')
    await edit.get('#edit-exercise-weight').setValue('40')
    await edit
      .findAll('button')
      .find((b) => b.text() === 'Cancel')!
      .trigger('click')
    await flushPromises()
    expect(dialog()).toBeNull()
    expect(detail('Squats')).toBe('15 reps a set')
  })

  it('edits the name, reps and per-side count, keeping the goal', async () => {
    await mountConfig()
    const edit = await openEdit('Kettlebell halos')
    const toggle = (name: string) =>
      edit.findAll('button[aria-pressed]').find((b) => b.text() === name)!
    expect(toggle('Each side').attributes('aria-pressed')).toBe('true')
    await edit.get('#edit-exercise-name').setValue('Halos')
    await edit.get('input[data-field="reps"]').setValue('1x0')
    await toggle('Per set').trigger('click')
    await edit.get('form').trigger('submit')
    await flushPromises()
    expect(detail('Halos')).toBe('10 reps a set')
    expect(ex().findAll('[data-testid="row-total"]').at(-1)!.text()).toBe('0 of 3')
  })

  it('closes on Escape and on Close without saving, returning focus to its Edit button', async () => {
    await mountConfig()
    for (const close of ['Escape', 'Close'] as const) {
      const opener = wrapper.get('button[aria-label="Edit Squats"]').element as HTMLElement
      opener.focus()
      const edit = await openEdit('Squats')
      await edit.get('#edit-exercise-weight').setValue('40')
      if (close === 'Escape') {
        document.activeElement!.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
        )
      } else {
        await edit.get('button[aria-label="Close"]').trigger('click')
      }
      await flushPromises()
      expect(dialog()).toBeNull()
      expect(document.activeElement).toBe(opener)
      expect(detail('Squats')).toBe('15 reps a set')
    }
  })

  it('stays open with the input when the name is blank', async () => {
    await mountConfig()
    const edit = await openEdit('Squats')
    await edit.get('#edit-exercise-name').setValue('  ')
    await edit.get('form').trigger('submit')
    await flushPromises()
    expect(dialog()).not.toBeNull()
    expect((dialog()!.get('#edit-exercise-name').element as HTMLInputElement).value).toBe('  ')
    expect(detail('Squats')).toBe('15 reps a set')
  })

  it('closes the dialog when another tab deletes the exercise', async () => {
    await mountConfig()
    await openEdit('Squats')
    const store = usePlannerStore()
    const other = emptyState()
    other.exercise.plans = { '2026-10-19': store.exercises.filter((e) => e.id !== 'sq') }
    otherTabWrites(other)
    await flushPromises()
    expect(dialog()).toBeNull()
  })

  it('stays open when another tab changes a different exercise', async () => {
    await mountConfig()
    await openEdit('Squats')
    const store = usePlannerStore()
    const other = emptyState()
    other.exercise.plans = { '2026-10-19': store.exercises.filter((e) => e.id !== 'pu') }
    otherTabWrites(other)
    await flushPromises()
    expect(dialog()).not.toBeNull()
  })

  it('offers no edit button for foods', () => {
    mountApp()
    expect(wrapper.find('button[aria-label="Edit Vegetables"]').exists()).toBe(false)
  })
})

describe('config mode and weekly plans', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    localStorage.clear()
  })
  afterEach(() => {
    wrapper?.unmount()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const button = (text: string) => wrapper.findAll('button').find((b) => b.text() === text)

  function chips(name: string): string {
    const row = ex()
      .findAll('[role="rowheader"]')
      .find((r) => r.get('[data-testid="item-name"]').text() === name)!
    return row
      .findAll('[data-testid="item-detail"]')
      .map((c) => c.text())
      .join(' · ')
  }

  it('hides every editing control in normal mode but still ticks cells', async () => {
    mountApp()
    const toggle = wrapper.get('button[role="switch"]')
    expect(toggle.attributes('aria-checked')).toBe('false')
    expect(wrapper.find('button[aria-label^="Edit Squats"]').exists()).toBe(false)
    expect(wrapper.find('button[aria-label^="Remove"]').exists()).toBe(false)
    expect(wrapper.find('button[aria-label^="Raise"]').exists()).toBe(false)
    expect(wrapper.find('#add-exercise-name').exists()).toBe(false)
    expect(wrapper.find('#add-food-name').exists()).toBe(false)
    expect(button('Copy plan to next week')).toBeUndefined()

    await rowCells('Squats')[0]!.trigger('click')
    expect(rowCells('Squats')[0]!.attributes('aria-pressed')).toBe('true')

    await toggle.trigger('click')
    expect(toggle.attributes('aria-checked')).toBe('true')
    expect(wrapper.find('button[aria-label="Edit Squats"]').exists()).toBe(true)
    expect(wrapper.find('button[aria-label="Remove Fish"]').exists()).toBe(true)
    expect(wrapper.find('#add-food-name').exists()).toBe(true)
  })

  it('copies the plan to next week and shows it', async () => {
    await mountConfig()
    const edit = await openEdit('Squats')
    await edit.get('input[data-field="sets"]').setValue('3')
    await edit.get('#edit-exercise-weight').setValue('12')
    await edit.get('form').trigger('submit')
    await flushPromises()
    expect(chips('Squats')).toBe('3 × 15 · 12 kg')

    await button('Copy plan to next week')!.trigger('click')
    await settle()
    expect(confirmation()).toBeNull()
    expect(wrapper.find('h1').text()).toBe('26 Oct – 1 Nov')
    expect(chips('Squats')).toBe('3 × 15 · 12 kg')
    expect(wrapper.find('[data-testid="carried-from"]').exists()).toBe(false)
  })

  it('asks before replacing a week that has its own plan', async () => {
    await mountConfig()
    await wrapper.get('button[aria-label="Next week"]').trigger('click')
    await rowCells('Squats')[0]!.trigger('click')
    await wrapper.get('button[aria-label="Previous week"]').trigger('click')
    await button('Copy plan to next week')!.trigger('click')
    await settle()
    expect(confirmation()!.get('h2').text()).toBe('Replace next week’s plan?')
    expect(confirmation()!.text()).toContain(
      'The week of 26 October already has its own plan. Copying replaces it with this week’s exercises and foods.',
    )
    await answer('Cancel')
    expect(wrapper.find('h1').text()).toBe('19–25 October')
    expect(rowCells('Squats')[0]!.attributes('aria-pressed')).toBe('false')

    await button('Copy plan to next week')!.trigger('click')
    await settle()
    await answer('Replace')
    expect(wrapper.find('h1').text()).toBe('26 Oct – 1 Nov')
    // The copy replaced next week's own plan; its tick stays in the log.
    expect(rowCells('Squats')[0]!.attributes('aria-pressed')).toBe('true')
  })

  it('says when a week’s plan is carried over from an earlier week', async () => {
    await mountConfig()
    await wrapper.get('button[aria-label="Raise Squats goal"]').trigger('click')
    await wrapper.get('button[aria-label="Next week"]').trigger('click')
    expect(wrapper.get('[data-testid="carried-from"]').text()).toContain('the week of 19 October')
    await wrapper.get('button[aria-label="Raise Squats goal"]').trigger('click')
    expect(wrapper.find('[data-testid="carried-from"]').exists()).toBe(false)
  })

  it('names exercise and food sources separately once they differ', async () => {
    await mountConfig()
    await wrapper.get('button[aria-label="Raise Squats goal"]').trigger('click')
    await wrapper.get('button[aria-label="Raise Fish goal"]').trigger('click')
    await wrapper.get('button[aria-label="Next week"]').trigger('click')
    expect(wrapper.get('[data-testid="carried-from"]').text()).toBe(
      'Uses the plan from the week of 19 October until you change this week.',
    )
    await rowCells('Squats')[0]!.trigger('click')
    expect(wrapper.get('[data-testid="carried-from"]').text()).toBe(
      'Uses the plan for foods from the week of 19 October until you change them this week.',
    )
  })

  /** Next week gets a plan of its own (a tick), so copying asks before replacing it. */
  async function giveNextWeekAPlan(): Promise<void> {
    await wrapper.get('button[aria-label="Next week"]').trigger('click')
    await rowCells('Squats')[0]!.trigger('click')
    await wrapper.get('button[aria-label="Previous week"]').trigger('click')
  }

  it('closes an open question when another tab signs in as someone else', async () => {
    await mountConfig()
    await giveNextWeekAPlan()
    await button('Copy plan to next week')!.trigger('click')
    await settle()
    expect(confirmation()).not.toBeNull()

    // Bob has a copy on this device, so his data shows at once, with no reload in between.
    api.addUser('bob')
    api.signedIn = 'bob'
    localStorage.setItem(CACHE_PREFIX + 'bob', JSON.stringify(emptyState()))
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: 'bob' }))
    window.dispatchEvent(
      new StorageEvent('storage', { key: SESSION_KEY, storageArea: localStorage }),
    )
    await flushPromises()
    await settle()
    expect(confirmation()).toBeNull()
    expect(wrapper.find('h1').text()).toBe('19–25 October')
  })

  it('does not replace a plan if the week changed while it asked', async () => {
    await mountConfig()
    await giveNextWeekAPlan()
    await button('Copy plan to next week')!.trigger('click')
    await settle()
    // Midnight on Sunday: the question named the week of 26 October, which is now this week.
    vi.setSystemTime(new Date(2026, 9, 26, 0, 5))
    usePlannerStore().refreshNow()
    await flushPromises()
    await answer('Replace')
    expect(wrapper.find('h1').text()).toBe('26 Oct – 1 Nov')
    expect(usePlannerStore().plans['2026-11-02']).toBeUndefined()
  })

  it('does not remove a row if the week changed while it asked', async () => {
    await mountConfig()
    await wrapper.get('button[aria-label="Remove Squats"]').trigger('click')
    await settle()
    vi.setSystemTime(new Date(2026, 9, 26, 0, 5))
    usePlannerStore().refreshNow()
    await flushPromises()
    await answer('Remove')
    expect(wrapper.find('h1').text()).toBe('26 Oct – 1 Nov')
    expect(rowCells('Squats')).toHaveLength(7)
  })

  it('adds the year to where a plan comes from once the year turns', async () => {
    vi.setSystemTime(new Date(2026, 11, 30, 18, 0))
    await mountConfig()
    await wrapper.get('button[aria-label="Previous week"]').trigger('click')
    await wrapper.get('button[aria-label="Raise Squats goal"]').trigger('click')
    await wrapper.get('button[aria-label="Next week"]').trigger('click')
    expect(wrapper.get('[data-testid="carried-from"]').text()).toContain('the week of 21 December')
    vi.setSystemTime(new Date(2027, 0, 1, 0, 5))
    usePlannerStore().refreshNow()
    await flushPromises()
    expect(wrapper.get('[data-testid="carried-from"]').text()).toContain(
      'the week of 21 December 2026',
    )
  })

  it('closes the edit dialog if the week changes under it', async () => {
    await mountConfig()
    await openEdit('Squats')
    expect(dialog()).not.toBeNull()
    usePlannerStore().nextWeek()
    await flushPromises()
    expect(dialog()).toBeNull()
  })

  it('adds an exercise with sets from the form', async () => {
    await mountConfig()
    await wrapper.get('#add-exercise-name').setValue('Swings')
    await wrapper.get('#add-exercise-sets').setValue('4x')
    await wrapper.get('#add-exercise-reps').setValue('20')
    await wrapper.get('form').trigger('submit')
    expect(chips('Swings')).toBe('4 × 20')
  })
})
