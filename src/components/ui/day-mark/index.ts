import type { Mark } from '@/lib/storage'

export { default as DayMark } from './DayMark.vue'

/**
 * The mark's strokes on a 36-unit square (DayMark card): a box drawn by hand, a little uneven like
 * one on a whiteboard, and what a marker pen puts in it. Each kind of mark has its own shape as
 * well as its own colour, so none rests on colour alone: a great day is scribbled full, a partial
 * day half full, a missed day crossed out. The strokes run past the box, as a quick hand does.
 * The card's previews draw the same paths.
 */
export const BOX_PATH =
  'M6.5 4.8C12.5 4.3 23.5 4.6 30.2 4.9C31.4 5 31.6 6.1 31.5 7.2C31.2 13.5 31.4 22.5 31.2 29.4C31.2 30.6 30.3 31.3 29.1 31.3C22.5 31.6 13 31.2 6.6 31.4C5.4 31.4 4.7 30.6 4.7 29.4C4.6 22.8 4.9 13 4.6 6.8C4.6 5.6 5.4 4.9 6.5 4.8Z'
export const MARK_PATHS: Record<Mark, string> = {
  great:
    'M3.2 7.4C11 5.4 21.5 4.6 33.4 5.4C24.5 9 14 13.2 3.8 18.6C13.5 16.3 24.2 14.8 34 15C24.2 19.4 13.6 24 4.4 29.8C14 27.6 24.6 26.4 33.4 26.9C27.2 29.6 21 32.2 15.2 34.6',
  partial:
    'M3.6 19.2C12 17.6 22.5 16.8 33.6 17.2C24.6 21 14.2 25.4 4.2 30.6C14 28.6 24.4 27.6 33.2 28.2',
  missed: 'M4.4 4.6C13 12.8 22.4 22.4 33 33.2M32.6 3.8C24.2 12.2 14 22.6 3.6 32.8',
}

/** Each mark's stroke colour: the pen for great, its own role for the other two (DayMark card). */
export const MARK_STROKES: Record<Mark, string> = {
  great: 'stroke-pen',
  partial: 'stroke-pen-partial',
  missed: 'stroke-pen-missed',
}

/** What a mark adds to the name; a great day says nothing more than aria-pressed does. */
const MARK_WORDS: Record<Mark, string | null> = {
  great: null,
  partial: 'partly done',
  missed: "couldn't do it",
}

/** What a DayMark is told about its day; `name` is the row (an exercise or a food). */
export interface DayMarkDay {
  name: string
  /** The full date as the name says it: "Thursday 22 October" (see `fullDate` in lib/dates). */
  date: string
  today?: boolean
  note?: boolean
  mark?: Mark | null
}

/**
 * The mark's accessible name (brand/design-system/project/components/DayMark): which row and
 * which day, then "today" and "has a note" when they apply. Whether the day is marked is
 * aria-pressed's to say; the name adds only a partial or missed day's kind:
 * "Squats, Thursday 22 October, today, partly done".
 */
export function dayMarkLabel({
  name,
  date,
  today = false,
  note = false,
  mark = null,
}: DayMarkDay): string {
  return [`${name}, ${date}`, today && 'today', note && 'has a note', mark && MARK_WORDS[mark]]
    .filter(Boolean)
    .join(', ')
}
