// Phone width (375px): nothing scrolls the page sideways, and in the week grid the keyboard never
// leaves a focused cell under the sticky name column.
import { expect, test } from '@playwright/test'
import {
  THEMES,
  expectNoSidewaysScroll,
  openApp,
  openSignIn,
  openSignUp,
  openStyleGuide,
  settle,
} from './support'

test.use({ viewport: { width: 375, height: 800 } })

test.describe('no sideways scroll at 375px', () => {
  for (const theme of THEMES) {
    test(`the style guide, ${theme}`, async ({ page }) => {
      await openStyleGuide(page, { theme })
      await expectNoSidewaysScroll(page)
    })
  }

  test('sign-in', async ({ page }) => {
    await openSignIn(page, 'light')
    await expectNoSidewaysScroll(page)
  })

  test('create an account', async ({ page }) => {
    await openSignUp(page, 'light')
    await expectNoSidewaysScroll(page)
  })

  test('the app, Today view', async ({ page }) => {
    await openApp(page, { view: 'today' })
    await expect(page.locator('[data-slot="today-list"]')).toBeVisible()
    await expectNoSidewaysScroll(page)
  })

  test('the app, Week view', async ({ page }) => {
    await openApp(page, { view: 'week' })
    await expect(page.getByTestId('exercise-grid')).toBeVisible()
    await expectNoSidewaysScroll(page)
  })

  test('the app, Week view in Edit plan', async ({ page }) => {
    await openApp(page, { view: 'week' })
    await page.getByRole('switch', { name: /Edit/ }).click()
    await settle(page)
    await expectNoSidewaysScroll(page)
  })
  test('the Settings page', async ({ page }) => {
    await openApp(page, { view: 'today' })
    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('heading', { level: 1, name: 'Settings' }).waitFor()
    await expectNoSidewaysScroll(page)
  })
})

test('a focused grid cell is never under the sticky name column', async ({ page }) => {
  await openApp(page, { view: 'week' })
  // The skip link lands on today's first mark; then the grid keys (gridNav) walk the week.
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  const keys = ['End', 'Home', ...Array<string>(8).fill('ArrowRight'), 'End']
  keys.push(...Array<string>(8).fill('ArrowLeft'), 'ArrowDown', 'End', 'ArrowUp', 'Home')

  const steps: string[] = []
  for (const key of ['(skip link)', ...keys]) {
    if (key !== '(skip link)') await page.keyboard.press(key)
    // The grid scrolls the focused cell into view on focusin; measure after the next frame.
    await page.evaluate(() => new Promise(requestAnimationFrame))
    const at = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement
      const grid = el.closest<HTMLElement>('[data-testid$="-grid"]')
      if (!grid) return { label: `not in a grid: ${el.tagName}`, ok: false }
      const names = grid.querySelector('thead th')!.getBoundingClientRect()
      const box = grid.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      const label = el.getAttribute('aria-label') ?? el.textContent!.trim().replace(/\s+/g, ' ')
      // A name cell is the sticky column itself, so it sits at the grid's left edge.
      const ok =
        el.closest('th[scope="row"]') !== null
          ? Math.round(r.left) === Math.round(box.left)
          : r.left >= names.right - 0.5 && r.right <= box.right + 0.5
      return {
        label: `${label} left=${Math.round(r.left)} names.right=${Math.round(names.right)}`,
        ok,
      }
    })
    steps.push(`${key}: ${at.label}${at.ok ? '' : '  <-- under the names or cut off'}`)
  }
  expect(
    steps.filter((s) => s.includes('<--')),
    steps.join('\n'),
  ).toEqual([])
})
