export { default as DayMark } from './DayMark.vue'

/**
 * The mark's two strokes on a 36-unit square (DayMark card): a box drawn by hand, a little
 * uneven like one on a whiteboard, and the marker squiggle that fills it on a done day. The
 * card's previews draw the same paths.
 */
export const BOX_PATH =
  'M6.5 4.8C12.5 4.3 23.5 4.6 30.2 4.9C31.4 5 31.6 6.1 31.5 7.2C31.2 13.5 31.4 22.5 31.2 29.4C31.2 30.6 30.3 31.3 29.1 31.3C22.5 31.6 13 31.2 6.6 31.4C5.4 31.4 4.7 30.6 4.7 29.4C4.6 22.8 4.9 13 4.6 6.8C4.6 5.6 5.4 4.9 6.5 4.8Z'
export const SQUIGGLE_PATH =
  'M9 10.5C13 9.5 19 9 26.5 9.2C20 11.5 14 14 9.4 17.2C15.5 15.8 21.5 14.8 27 14.6C20.5 17.4 14.5 20.6 9.6 24C16 22.6 22 21.8 27.2 21.8C23 23.6 19 25.4 15.5 27.4'

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
