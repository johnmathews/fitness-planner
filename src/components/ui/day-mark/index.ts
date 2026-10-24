export { default as DayMark } from './DayMark.vue'

/** What a DayMark is told about its day; `name` is the row (an exercise or a food). */
export interface DayMarkDay {
  name: string
  /** The full date as the name says it: "Thursday 22 October" (see `fullDate` in lib/dates). */
  date: string
  today?: boolean
  note?: boolean
}

/**
 * The mark's accessible name (brand/design-system/project/components/DayMark): which row and
 * which day, then "today" and "has a note" when they apply, and never the state, which
 * aria-pressed carries: "Squats, Thursday 22 October, today, has a note".
 */
export function dayMarkLabel({ name, date, today = false, note = false }: DayMarkDay): string {
  return [`${name}, ${date}`, today && 'today', note && 'has a note'].filter(Boolean).join(', ')
}
