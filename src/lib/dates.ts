export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

/** Local-midnight Monday of the week containing `now`, shifted by `weekOffset` weeks. */
export function mondayOf(now: Date, weekOffset = 0): Date {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + weekOffset * 7)
  return d
}

/** `YYYY-MM-DD` in local time — the key format the prototype stores in `log`. */
export function dateKey(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

/** The local-time date for a `YYYY-MM-DD` key (the inverse of `dateKey`). */
export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

export function addDays(d: Date, days: number): Date {
  const out = new Date(d)
  out.setDate(d.getDate() + days)
  return out
}

/** The seven dates Mon–Sun starting at `monday`. */
export function weekDates(monday: Date): Date[] {
  return DAY_NAMES.map((_, i) => addDays(monday, i))
}

/** "Oct 19" */
export function formatShort(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** "Oct 19 – Oct 25, 2026" — the year is the Sunday's, so a week spanning New Year reads correctly. */
export function weekLabel(monday: Date): string {
  const sunday = addDays(monday, 6)
  return `${formatShort(monday)} – ${formatShort(sunday)}, ${sunday.getFullYear()}`
}

/** "26 October": a date as the app's sentences write it (voice.md). */
export function dayMonth(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

/**
 * The Header's week label (components/Header): "19–25 October" within a month, and
 * "28 Sep – 4 Oct" across one, short enough for a 320px screen.
 */
export function weekRange(monday: Date): string {
  const sunday = addDays(monday, 6)
  if (sunday.getMonth() === monday.getMonth()) return `${monday.getDate()}–${dayMonth(sunday)}`
  const short = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${short(monday)} – ${short(sunday)}`
}
