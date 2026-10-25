// The planner's screens (PlannerScreen card, K24): with more rows than fit, a section scrolls
// as usual, but the page never comes to rest showing part of both sections at once.
import { expect, test, type Page } from '@playwright/test'
import { openApp } from './support'

test.use({ viewport: { width: 1280, height: 800 } })
// Forty wheel steps, each left to settle.
test.setTimeout(90_000)

/** Where the sections sit once the scroll has come to rest. */
async function atRest(page: Page) {
  await page.waitForTimeout(700)
  return page.evaluate(() => {
    const ex = document
      .querySelector('[aria-labelledby="exercises-heading"]')!
      .getBoundingClientRect()
    return { exBottom: Math.round(ex.bottom), exHeight: Math.round(ex.height), vh: innerHeight }
  })
}

/** Wheels `steps` times by `dy`, noting each place the scroll comes to rest. */
async function wheel(page: Page, steps: number, dy: number) {
  const stops: string[] = []
  const ends = new Set<string>()
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, dy)
    const at = await atRest(page)
    // Exercises' foot inside the screen means part of Food shows beneath it.
    const both = at.exBottom > 1 && at.exBottom < at.vh - 1
    if (Math.abs(at.exBottom - at.vh) <= 1) ends.add('exercises-end')
    if (Math.abs(at.exBottom) <= 1) ends.add('food-start')
    stops.push(
      `${dy > 0 ? 'down' : 'up'} ${i + 1}: Exercises ends at ${at.exBottom} of ${at.vh}${both ? '  <-- both' : ''}`,
    )
  }
  return { stops, ends }
}

for (const [name, opts] of [
  ['a tall Exercises screen', { moreExercises: 10 }],
  ['a tall Food screen', { moreFoods: 14 }],
] as const) {
  test(`${name} scrolls as usual, and never rests beside the other`, async ({ page }) => {
    await openApp(page, opts)
    await page.mouse.move(640, 400)
    const down = await wheel(page, 20, 120)
    const up = await wheel(page, 20, -120)
    const stops = [...down.stops, ...up.stops]
    expect(
      stops.filter((s) => s.includes('<--')),
      stops.join('\n'),
    ).toEqual([])
    expect(down.ends.has('food-start'), stops.join('\n')).toBe(true)
  })
}
