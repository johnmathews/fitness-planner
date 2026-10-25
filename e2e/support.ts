// Shared set-up for the browser checks: a signed-in app with /api mocked, the style guide in any
// look, axe, and the measurements the specs repeat.
import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

/** Longer than the slowest transition (120ms in the primitives, 150ms in older screens). */
export const SETTLE_MS = 400

/** The inks a person can pick (src/lib/inks.ts); the style guide takes them as `?ink=`. */
export const INKS = ['ink-blue', 'forest', 'violet', 'graphite'] as const
export const THEMES = ['light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

/**
 * The app's "today": Wednesday 21 October 2026, so the week, its labels and the scroll position
 * the grids open at are the same on every run. Noon keeps it clear of midnight in any timezone.
 */
export const TODAY = new Date('2026-10-21T12:00:00')
const MONDAY = '2026-10-19'

const T = true
const F = false

/** A week with a plan and some ticks, as GET /api/state returns it. */
function state() {
  return {
    exercise: {
      plans: {
        [MONDAY]: [
          { id: 'pu', name: 'Push-ups', sets: 3, reps: 12, target: 4 },
          { id: 'pl', name: 'Pull-ups', sets: 3, reps: 5, target: 3 },
          { id: 'sq', name: 'Squats', sets: 3, reps: 15, weight: 16, target: 3 },
          { id: 'be', name: 'Back extensions', reps: 12, target: 3 },
          { id: 'kh', name: 'Kettlebell halos', reps: 8, perSide: true, target: 2 },
        ],
      },
      log: {
        [MONDAY]: {
          pu: [T, F, T, F, F, F, F],
          pl: [T, F, F, F, F, F, F],
          sq: [F, T, T, F, F, F, F],
          be: [F, F, F, F, F, F, F],
          kh: [F, T, F, F, F, F, F],
        },
      },
      revs: {},
    },
    diet: {
      plans: {},
      log: { [MONDAY]: { veg: [T, T, F, F, F, F, F], fish: [T, F, F, F, F, F, F] } },
      revs: {},
    },
    settings: null,
  }
}

/**
 * Opens the app signed in as alice, with the API mocked: /auth/me knows her, /state returns the
 * week above, and every write succeeds. `view` is the phone view the device remembers.
 */
export async function openApp(
  page: Page,
  { theme = 'light', view }: { theme?: Theme; view?: 'today' | 'week' } = {},
): Promise<void> {
  await page.clock.setFixedTime(TODAY)
  const s = state()
  await page.route('**/api/**', async (route) => {
    const req = route.request()
    const path = new URL(req.url()).pathname.replace(/^\/api/, '')
    if (req.method() === 'GET' && path === '/auth/me')
      return route.fulfill({ json: { username: 'alice' } })
    if (req.method() === 'GET' && path === '/state') return route.fulfill({ json: s })
    if (req.method() === 'PUT') return route.fulfill({ json: { rev: 1 } })
    return route.fulfill({ json: {} })
  })
  await page.addInitScript(
    ([st, theme, view]) => {
      // Once per test: a reload keeps what the app itself wrote since.
      if (sessionStorage.getItem('e2e-seeded')) return
      sessionStorage.setItem('e2e-seeded', '1')
      localStorage.setItem('fitness-planner-session-v1', JSON.stringify({ user: 'alice' }))
      localStorage.setItem('fitness-planner-cache-v1:alice', JSON.stringify(st))
      localStorage.setItem('fitness-planner-settings-v1', JSON.stringify({ theme }))
      if (view) localStorage.setItem('fitness-planner-view-v1', JSON.stringify(view))
    },
    [s, theme, view ?? null] as const,
  )
  await page.goto('/')
  await page.waitForSelector('[data-slot="today-list"], [data-testid="exercise-grid"]')
  await settle(page)
}

/** Opens the sign-in screen: nobody is signed in and the API says so. */
export async function openSignIn(page: Page, theme: Theme): Promise<void> {
  await openSignedOut(page, theme, '/')
}

/** Opens the create-an-account screen (`#/signup`), signed out. */
export async function openSignUp(page: Page, theme: Theme): Promise<void> {
  await openSignedOut(page, theme, '/#/signup')
}

async function openSignedOut(page: Page, theme: Theme, path: string): Promise<void> {
  await page.route('**/api/**', (route) => route.fulfill({ status: 401, json: {} }))
  await page.addInitScript((theme) => {
    localStorage.setItem('fitness-planner-settings-v1', JSON.stringify({ theme }))
  }, theme)
  await page.goto(path)
  await page.waitForSelector('form')
  await settle(page)
}

/** Opens the style guide in a look, through the query string it reads (src/styleguide/look.ts). */
export async function openStyleGuide(
  page: Page,
  { theme = 'light', ink = 'ink-blue' }: { theme?: Theme; ink?: (typeof INKS)[number] } = {},
): Promise<void> {
  await page.goto(`/styleguide?theme=${theme}&ink=${ink}`)
  await page.waitForSelector('#sg-main section')
  await settle(page)
}

/** Waits for web fonts and for transitions (colour, outline, size) to finish. */
export async function settle(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(SETTLE_MS)
}

/** The page's --canvas token: proof the theme really switched, whatever paints the background. */
export function canvasToken(page: Page): Promise<string> {
  return page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim(),
  )
}

/**
 * Runs axe for WCAG 2.2 A and AA, plus axe's best practices (heading order, landmarks), and fails
 * with one line per rule: how many nodes, and the first few with axe's reason.
 */
export async function expectNoAxeViolations(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'])
    .analyze()
  expect(
    violations.map((v) => {
      const nodes = v.nodes.slice(0, 3).map((n) => {
        // The summary's second line is the reason ("…insufficient color contrast of 2.65…").
        const reason = n.failureSummary?.split('\n')[1]?.trim()
        return `${n.target.join(' ')}${reason ? ` [${reason}]` : ''}`
      })
      const more = v.nodes.length > 3 ? `; and ${v.nodes.length - 3} more` : ''
      return `${v.id} (${v.impact}, ${v.nodes.length} nodes): ${nodes.join('; ')}${more}`
    }),
  ).toEqual([])
}

/** No sideways scroll: the page is no wider than the viewport. A failure names what sticks out. */
export async function expectNoSidewaysScroll(page: Page): Promise<void> {
  const size = await page.evaluate(() => {
    const innerWidth = window.innerWidth
    // What sticks out past the viewport, leaving out what scrolls inside its own box (the grids).
    const clipped = (el: HTMLElement) => {
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (getComputedStyle(a).overflowX !== 'visible') return true
      }
      return false
    }
    const wide = [...document.body.querySelectorAll<HTMLElement>('*')]
      .filter((el) => el.getBoundingClientRect().right > innerWidth + 0.5 && !clipped(el))
      .slice(0, 3)
      .map((el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}`)
    return { scrollWidth: document.documentElement.scrollWidth, innerWidth, wide }
  })
  expect(
    size.scrollWidth,
    `page is ${size.scrollWidth}px wide in a ${size.innerWidth}px viewport (${size.wide.join(', ')})`,
  ).toBeLessThanOrEqual(size.innerWidth)
}
