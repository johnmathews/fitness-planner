/**
 * The planner screen on the design system's marks (W10): the WeekGrid, DayMark, SectionHeader,
 * StatFigure and Chip cards in brand/design-system/project/components/, mounted in the real app.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'
import { emptyState, signedIn } from '@/lib/__tests__/signedIn'
import type { SyncState } from '@/stores/sync'

// Friday 23 October 2026: today is the fifth column; Saturday and Sunday are still to come.
const NOW = new Date(2026, 9, 23, 18, 0)
const WEEK = '2026-10-19'

let wrapper: VueWrapper

function mountApp(cache?: SyncState): VueWrapper {
  signedIn(cache)
  const pinia = createPinia()
  setActivePinia(pinia)
  wrapper = mount(App, { global: { plugins: [pinia] }, attachTo: document.body })
  return wrapper
}

async function mountConfig(cache?: SyncState): Promise<VueWrapper> {
  mountApp(cache)
  await wrapper.get('button[role="switch"]').trigger('click')
  return wrapper
}

const ex = () => wrapper.get('[data-testid="exercise-grid"]')
const diet = () => wrapper.get('[data-testid="diet-grid"]')
const marks = (name: string) => wrapper.findAll(`button[aria-label^="${name},"]`)
const counts = () => ex().findAll('[data-testid="day-count"]')

/** A week where Monday has four exercises marked, one over the default pick of three. */
function overPicked(n = 4): SyncState {
  const state = emptyState()
  const on = [true, false, false, false, false, false, false]
  const ids = ['pu', 'pl', 'sq', 'be', 'kh'].slice(0, n)
  state.exercise.log = { [WEEK]: Object.fromEntries(ids.map((id) => [id, [...on]])) }
  return state
}

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++) await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('the planner grids (W10)', () => {
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

  describe('the picked row (F3)', () => {
    it('says "one extra" under a day over the pick, underlined, never by colour alone', () => {
      mountApp(overPicked(4))
      const monday = counts()[0]!
      expect(monday.attributes('data-tone')).toBe('over')
      expect(monday.get('[data-testid="day-count-figure"]').text()).toBe('4')
      expect(monday.get('[data-testid="day-count-figure"]').classes()).toEqual(
        expect.arrayContaining(['text-caution-ink', 'underline']),
      )
      expect(monday.get('[data-testid="day-count-extra"]').text()).toBe('one extra')
    })

    it('writes the amount over in words', () => {
      mountApp(overPicked(5))
      expect(counts()[0]!.get('[data-testid="day-count-extra"]').text()).toBe('two extra')
    })

    it('shows the pick at weight 600 in ink, under it quiet, and an en dash for days to come', () => {
      mountApp(overPicked(3))
      const [monday, tuesday] = counts()
      expect(monday!.attributes('data-tone')).toBe('met')
      expect(monday!.text()).toBe('3')
      expect(monday!.find('[data-testid="day-count-extra"]').exists()).toBe(false)
      expect(tuesday!.attributes('data-tone')).toBe('under')
      expect(tuesday!.text()).toBe('0')
      // Saturday: nothing marked yet, and it hasn't happened.
      const saturday = counts()[5]!
      expect(saturday.attributes('data-tone')).toBe('future')
      expect(saturday.get('[aria-hidden="true"]').text()).toBe('–')
      expect(saturday.get('.sr-only').text()).toBe('Not yet')
    })

    it('names the row "Picked" with the pick as its caption, and leaves no empty focusable cell', () => {
      mountApp()
      const row = ex().get('tfoot tr')
      expect(row.get('[role="rowheader"]').text()).toBe('Picked3 a day')
      const cells = row.findAll('td')
      expect(cells).toHaveLength(8)
      const week = cells.at(-1)!
      expect(week.text()).toBe('')
      expect(week.attributes('aria-hidden')).toBe('true')
      expect(week.attributes('tabindex')).toBeUndefined()
    })
  })

  describe('today (F16)', () => {
    it('names today’s marks with the full date and "today", and sets aria-current', () => {
      mountApp()
      const squats = marks('Squats')
      expect(squats[4]!.attributes('aria-label')).toBe('Squats, Friday 23 October, today')
      expect(squats[4]!.attributes('aria-current')).toBe('date')
      expect(squats[0]!.attributes('aria-label')).toBe('Squats, Monday 19 October')
      expect(squats[0]!.attributes('aria-current')).toBeUndefined()
    })

    it('marks today’s column header, and puts the band on today’s cells only', () => {
      mountApp()
      const heads = ex().findAll('[data-testid="day-head"]')
      expect(heads[4]!.attributes('aria-current')).toBe('date')
      expect(heads[4]!.text()).toBe('Fri23, today')
      expect(heads[3]!.attributes('aria-current')).toBeUndefined()
      expect(heads[0]!.text()).toBe('Mon19')
      const cells = ex().findAll('tbody tr')[0]!.findAll('td')
      expect(cells.map((c) => c.classes().includes('bg-highlight'))).toEqual([
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
      ])
    })

    it('draws the mark as a pen dot when done and a ring when not', async () => {
      mountApp()
      const mark = marks('Push-ups')[1]!
      expect(mark.get('[data-slot="day-mark-dot"]').classes()).toContain('border-control-border')
      await mark.trigger('click')
      expect(mark.attributes('aria-pressed')).toBe('true')
      expect(mark.get('[data-slot="day-mark-dot"]').classes()).toEqual(
        expect.arrayContaining(['bg-pen', 'border-pen']),
      )
      expect(mark.text()).toBe('')
    })
  })

  describe('totals (F6, F13)', () => {
    it('writes a row total as "N of M", and marks a met one with more than colour', async () => {
      mountApp()
      const total = () => ex().findAll('[data-testid="row-total"]')[3]!
      expect(total().text()).toBe('0 of 3')
      expect(total().find('[data-slot="met-mark"]').exists()).toBe(false)
      for (const i of [0, 1, 2]) await marks('Back extensions')[i]!.trigger('click')
      expect(total().text()).toBe('3 of 3')
      expect(total().attributes('data-met')).toBe('true')
      expect(total().find('[data-slot="met-mark"]').exists()).toBe(true)
    })

    it('starts a fresh week’s figures quiet, never in pen (F13)', () => {
      mountApp()
      const exercises = wrapper.get('[data-testid="grand-total"]')
      expect(exercises.text()).toBe('0 of 18 this week')
      expect(exercises.attributes('data-state')).toBe('zero')
      expect(exercises.html()).not.toContain('text-pen')
      const foods = wrapper.get('[data-testid="diet-goals-met"]')
      expect(foods.text()).toBe('0 of 4 goals met')
      expect(foods.attributes('data-state')).toBe('zero')
      expect(foods.html()).not.toContain('text-pen')
    })

    it('marks a met section figure with a check as well as the pen (F6)', async () => {
      const state = emptyState()
      state.diet.plans = { [WEEK]: [{ id: 'fish', name: 'Fish', target: 1 }] }
      state.diet.log = { [WEEK]: { fish: [true, false, false, false, false, false, false] } }
      mountApp(state)
      const foods = wrapper.get('[data-testid="diet-goals-met"]')
      expect(foods.text()).toBe('1 of 1 goals met')
      expect(foods.attributes('data-state')).toBe('met')
      expect(foods.find('[data-slot="met-mark"]').exists()).toBe(true)
    })
  })

  describe('rows', () => {
    it('shows the goal in the row header and the chips in the card’s words', () => {
      mountApp()
      const row = ex()
        .findAll('[role="rowheader"]')
        .find((r) => r.text().startsWith('Kettlebell halos'))!
      expect(row.findAll('[data-testid="item-detail"]').map((c) => c.text())).toEqual([
        '8 each side',
      ])
      expect(row.get('[data-testid="item-goal"]').text()).toBe('3 a week')
    })

    it('puts the edit, remove and goal controls in the row header, as IconButtons (F28)', async () => {
      await mountConfig()
      const edit = ex().get('button[aria-label="Edit Squats"]')
      const remove = ex().get('button[aria-label="Remove Squats"]')
      expect(edit.attributes('data-slot')).toBe('icon-button')
      expect(remove.attributes('data-slot')).toBe('icon-button')
      expect(edit.text()).toBe('')
      const header = edit.element.closest('[role="rowheader"]')!
      expect(header.contains(remove.element)).toBe(true)
      expect(header.querySelector('[role="spinbutton"]')).not.toBeNull()
      // The total column holds only the total now.
      expect(ex().findAll('[data-testid="row-total"]')[2]!.element.closest('td')!.textContent).toBe(
        '0 of 4',
      )
    })

    it('keeps the goal caption’s space in edit mode, so the row keeps its height (F25)', async () => {
      await mountConfig()
      const goal = ex().findAll('[data-testid="item-goal"]')[0]!
      expect(goal.classes()).toContain('invisible')
      await wrapper.get('button[role="switch"]').trigger('click')
      expect(ex().findAll('[data-testid="item-goal"]')[0]!.classes()).not.toContain('invisible')
    })

    /** Press a row's Remove, then answer the ConfirmDialog with `answer`. */
    async function removeRow(grid: ReturnType<typeof ex>, name: string, answer: string) {
      await grid.get(`button[aria-label="Remove ${name}"]`).trigger('click')
      await settle()
      const dialog = new DOMWrapper(document.querySelector<HTMLElement>('[role="alertdialog"]')!)
      await dialog
        .findAll('button')
        .find((b) => b.text() === answer)!
        .trigger('click')
      await settle()
      await flushPromises()
    }
    const focused = () => document.activeElement?.getAttribute('aria-label')

    it('moves focus to the next row’s Remove after a removal, not to the page', async () => {
      await mountConfig()
      await removeRow(ex(), 'Squats', 'Cancel')
      expect(focused()).toBe('Remove Squats')
      await removeRow(ex(), 'Squats', 'Remove')
      expect(marks('Squats')).toHaveLength(0)
      expect(focused()).toBe('Remove Back extensions')
      // Focus put back on a control lets its row's controls into the Tab order (gridNav).
      expect(document.activeElement!.getAttribute('tabindex')).toBeNull()
      expect(ex().get('button[aria-label="Edit Back extensions"]').attributes('tabindex')).toBe(
        undefined,
      )
      expect(ex().get('button[aria-label="Edit Pull-ups"]').attributes('tabindex')).toBe('-1')
    })

    it('falls back to the previous row, then to the add form, as rows run out', async () => {
      await mountConfig()
      await removeRow(diet(), 'Nuts', 'Remove')
      expect(focused()).toBe('Remove Fish')
      for (const name of ['Fish', 'Fruit', 'Vegetables']) await removeRow(diet(), name, 'Remove')
      expect(document.activeElement?.id).toBe('add-food-name')
    })
  })

  describe('keyboard (F15, W11)', () => {
    /** What Tab stops on, in page order (jsdom has no layout, so visibility isn't checked). */
    function tabStops(): HTMLElement[] {
      return [
        ...document.querySelectorAll<HTMLElement>(
          'a[href], button, input, select, textarea, [tabindex]',
        ),
      ].filter((el) => el.tabIndex >= 0 && !el.matches(':disabled'))
    }
    const name = (el: Element | null) =>
      el?.getAttribute('aria-label') ?? el?.textContent?.trim() ?? null
    const focused = () => document.activeElement as HTMLElement
    async function press(key: string, init: KeyboardEventInit = {}): Promise<void> {
      focused().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }))
      await flushPromises()
    }

    it('makes each grid a WAI-ARIA grid with one tab stop, on today’s cell in the first row', () => {
      mountApp()
      const grids: [ReturnType<typeof ex>, string][] = [
        [ex(), 'Push-ups, Friday 23 October, today'],
        [diet(), 'Vegetables, Friday 23 October, today'],
      ]
      for (const [grid, today] of grids) {
        expect(grid.get('table').attributes('role')).toBe('grid')
        expect(grid.findAll('[role="gridcell"]').length).toBeGreaterThan(0)
        expect(grid.find('[role="cell"]').exists()).toBe(false)
        const stops = tabStops().filter((el) => grid.element.contains(el))
        expect(stops.map(name)).toEqual([today])
      }
    })

    it('stops on the skip link, the Header, then each grid once', () => {
      mountApp()
      expect(tabStops().map(name)).toEqual([
        'Skip to today',
        'Previous week',
        'Next week',
        'Edit plan',
        'Settings',
        'Print…',
        'Push-ups, Friday 23 October, today',
        'Vegetables, Friday 23 October, today',
      ])
    })

    it('moves by arrow keys cell by cell, and Home and End along the row', async () => {
      mountApp()
      ;(marks('Push-ups')[4]!.element as HTMLElement).focus()
      await press('ArrowRight')
      expect(name(focused())).toBe('Push-ups, Saturday 24 October')
      await press('ArrowDown')
      expect(name(focused())).toBe('Pull-ups, Saturday 24 October')
      await press('End')
      expect(focused().textContent).toBe('0 of 4')
      expect(focused().getAttribute('role')).toBe('gridcell')
      await press('Home')
      expect(focused().getAttribute('role')).toBe('rowheader')
      expect(focused().textContent).toContain('Pull-ups')
      // The tab stop follows, so Tab comes back to the last cell used.
      expect(tabStops().filter((el) => ex().element.contains(el))).toEqual([focused()])
      await press('End', { ctrlKey: true })
      expect(focused().closest('tfoot')).not.toBeNull()
      expect(focused().textContent).toContain('Not yet')
    })

    it('toggles a day on Space or Enter only through its DayMark, as a button', async () => {
      mountApp()
      const mark = marks('Squats')[4]!
      ;(mark.element as HTMLElement).focus()
      await press('ArrowRight')
      await press('ArrowLeft')
      expect(focused()).toBe(mark.element)
      await mark.trigger('click')
      expect(mark.attributes('aria-pressed')).toBe('true')
    })

    it('has a "Skip to today" link first, which focuses today’s exercise cell', async () => {
      mountApp()
      const skip = wrapper.get('a[data-testid="skip-to-today"]')
      expect(skip.text()).toBe('Skip to today')
      expect(skip.classes()).toContain('sr-only')
      await skip.trigger('click')
      expect(name(focused())).toBe('Push-ups, Friday 23 October, today')
    })

    it('skips to the Diet grid when there are no exercises', async () => {
      const state = emptyState()
      state.exercise.plans = { [WEEK]: [] }
      mountApp(state)
      await wrapper.get('a[data-testid="skip-to-today"]').trigger('click')
      expect(name(focused())).toBe('Vegetables, Friday 23 October, today')
    })

    it('skips to the first day in another week, and to the grid when it has no rows', async () => {
      // This week has nothing planned; the week before falls back to the default plan.
      const state = emptyState()
      state.exercise.plans = { [WEEK]: [] }
      state.diet.plans = { [WEEK]: [] }
      mountApp(state)
      const skip = wrapper.get('a[data-testid="skip-to-today"]')
      await skip.trigger('click')
      expect(focused().getAttribute('role')).toBe('rowheader')
      expect(focused().textContent).toContain('Picked')
      ;(document.activeElement as HTMLElement).blur()
      await wrapper.get('button[aria-label="Previous week"]').trigger('click')
      await flushPromises()
      await skip.trigger('click')
      expect(name(focused())).toBe('Push-ups, Monday 12 October')
    })

    it('keeps one stop per grid in Edit plan; Enter on a name reaches its controls', async () => {
      await mountConfig()
      expect(tabStops().filter((el) => ex().element.contains(el))).toHaveLength(1)
      ;(marks('Squats')[0]!.element as HTMLElement).focus()
      await press('Home')
      expect(focused().getAttribute('role')).toBe('rowheader')
      await press('Enter')
      expect(name(focused())).toBe('Lower Squats goal')
      const header = focused().closest('th')!
      // The name cell keeps the tab stop (Shift+Tab returns to it), then its controls in order.
      const inHeader = tabStops().filter((el) => header.contains(el))
      expect(inHeader[0]).toBe(header)
      expect(inHeader.slice(1).map((el) => el.getAttribute('aria-label') ?? el.tagName)).toEqual([
        'Lower Squats goal',
        'INPUT',
        'Raise Squats goal',
        'Edit Squats',
        'Remove Squats',
      ])
      await press('Escape')
      expect(focused()).toBe(header)
      expect(tabStops().filter((el) => ex().element.contains(el))).toEqual([header])
    })
  })

  describe('headings and print (F20, F24)', () => {
    it('heads the page with the week as the Header writes it', () => {
      mountApp()
      expect(wrapper.get('h1').text()).toBe('19–25 October')
    })

    it('gives each section an h2, its one figure and a hint that does not print', () => {
      mountApp()
      const sections = wrapper.findAll('section[aria-labelledby]')
      expect(sections.map((s) => s.get('h2').text())).toEqual(['Exercises', 'Diet'])
      const hints = wrapper.findAll('[data-slot="section-hint"]')
      expect(hints.map((h) => h.text())).toEqual([
        'Pick three a day. Mark each one when it’s done.',
        'Mark each day you ate it.',
      ])
      for (const hint of hints) expect(hint.attributes('data-noprint')).toBeDefined()
    })

    it('keeps the Diet heading with its grid on paper', () => {
      mountApp()
      const header = wrapper.get('#diet-heading').element.closest('[data-slot="section-header"]')!
      expect(header.classList).toContain('print:break-after-avoid')
      const block = diet().element.closest('[data-print-keep]')!
      expect(block.contains(header)).toBe(true)
      expect(block.classList).toContain('print:break-inside-avoid')
    })
  })
})
