// An item's note (WeekGrid card, K43): one line under the name and chips, and the whole of it in
// a popover with working links. The popover opens in a real browser here; jsdom can't lay it out.
import { expect, test } from '@playwright/test'
import { openApp } from './support'

test.use({ viewport: { width: 1280, height: 800 } })

test('a note shows on one line, and a press opens it whole with its link', async ({ page }) => {
  await openApp(page)
  const grid = page.getByTestId('exercise-grid')
  const note = grid.getByRole('row', { name: /Push-ups/ }).getByTestId('item-note')
  await expect(note).toHaveText('Slow on the way down. Form video')
  await expect(note.locator('a')).toHaveCount(0)
  // Its line sits below the name's line, which the chips share.
  const name = grid.getByRole('row', { name: /Push-ups/ }).getByTestId('item-name')
  const chip = grid.getByRole('row', { name: /Push-ups/ }).getByTestId('item-detail')
  const [n, c, l] = await Promise.all([name.boundingBox(), chip.boundingBox(), note.boundingBox()])
  expect(Math.abs(n!.y + n!.height / 2 - (c!.y + c!.height / 2))).toBeLessThan(4)
  expect(l!.y).toBeGreaterThanOrEqual(n!.y + n!.height - 1)

  await note.click()
  const panel = page.getByRole('dialog', { name: 'Push-ups' })
  await expect(panel).toBeVisible()
  const link = panel.getByRole('link', { name: 'Form video' })
  await expect(link).toHaveAttribute('href', 'https://example.com/push-ups')
  await expect(link).toHaveAttribute('target', '_blank')
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(link).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  // Escape parks the cell's controls and puts focus back on the cell (gridNav), as in Edit plan.
  await expect(grid.getByRole('rowheader', { name: /Push-ups/ })).toBeFocused()
})

test('a row without a note is one line', async ({ page }) => {
  await openApp(page)
  const row = page.getByTestId('exercise-grid').getByRole('row', { name: /Squats/ })
  await expect(row.getByTestId('item-note')).toHaveCount(0)
})
