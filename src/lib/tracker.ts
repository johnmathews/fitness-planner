import { DAY_NAMES } from '@/lib/dates'
import type { Log } from '@/lib/storage'
import { numberWord } from '@/lib/words'

/** Anything tracked as a tick per day against a weekly goal: exercises and foods. */
export type Tracked = { id: string; name: string; target: number }

/** One row of the Today list: the item, its chips (exercises only), today's mark and the week. */
export type TodayItem = Tracked & { chips?: string[]; done: boolean; total: number }

/**
 * A day's count in the Picked row against the daily pick (WeekGrid card): at the pick, over it,
 * under it, or a day still to come with nothing marked.
 */
export type CountTone = 'met' | 'over' | 'under' | 'future'

/** One cell of the Picked row: the count, its tone, and the amount over in words. */
export type PickedCount = { n: number; tone: CountTone; extra: string | null }

/**
 * Over the pick says how far over in words ("one extra", "two extra"), so it never rests on
 * colour (F3). A day still to come with nothing marked shows an en dash instead of a 0.
 */
export function pickedCount(n: number, pick: number, future: boolean): PickedCount {
  if (future && n === 0) return { n, tone: 'future', extra: null }
  if (n > pick) return { n, tone: 'over', extra: `${numberWord(n - pick)} extra` }
  return { n, tone: n === pick ? 'met' : 'under', extra: null }
}

/**
 * The Today list's summary (TodayList card): today's exercises against the daily pick, in words.
 * What is done, then what is left; at the pick it stops; over it, it says how far, as the Picked
 * row does. No praise and no guilt: "None yet. Three to go.", "Two of three. One to go.",
 * "Three of three.", "Four today, one extra."
 */
export function todaySummary(done: number, pick: number): string {
  if (done === 0) return `None yet. ${numberWord(pick, true)} to go.`
  if (done < pick) {
    return `${numberWord(done, true)} of ${numberWord(pick)}. ${numberWord(pick - done, true)} to go.`
  }
  if (done === pick) return `${numberWord(done, true)} of ${numberWord(pick)}.`
  return `${numberWord(done, true)} today, ${numberWord(done - pick)} extra.`
}

/** One week of a log: item id → done flags Mon–Sun. */
export type WeekLog = Record<string, boolean[]>

export function isDone(week: WeekLog, id: string, day: number): boolean {
  return week[id]?.[day] === true
}

export function totalFor(week: WeekLog, id: string): number {
  return (week[id] ?? []).filter(Boolean).length
}

/** How many of `items` are ticked on each day. Log entries for removed items don't count. */
export function dayCounts(items: Tracked[], week: WeekLog): number[] {
  return DAY_NAMES.map((_, i) => items.filter((it) => isDone(week, it.id, i)).length)
}

export function grandTotal(items: Tracked[], week: WeekLog): number {
  return items.reduce((sum, it) => sum + totalFor(week, it.id), 0)
}

export function goalMet(total: number, target: number): boolean {
  return target > 0 && total >= target
}

export function goalsMet(items: Tracked[], week: WeekLog): number {
  return items.filter((it) => goalMet(totalFor(week, it.id), it.target)).length
}

/** Flip one day in place, creating the week and the item's flags on first use. */
export function toggleDay(log: Log, weekKey: string, id: string, day: number): void {
  // Read each level back through `log` rather than keeping the `??=` result: on a reactive log
  // that result is the raw object, and a change made to it would notify no watcher.
  log[weekKey] ??= {}
  const week = log[weekKey]!
  week[id] ??= Array<boolean>(7).fill(false)
  const flags = week[id]!
  flags[day] = !flags[day]
}

export function newId(): string {
  return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}
