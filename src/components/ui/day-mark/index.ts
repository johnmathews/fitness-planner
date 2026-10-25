import type { Mark } from '@/lib/storage'

export { default as DayMark } from './DayMark.vue'

/**
 * The mark's drawings on a 36-unit square (DayMark card): a box drawn by hand, a little uneven like
 * one on a whiteboard, and three ways a marker pen fills it, traced from the owner's own marks: an
 * open zigzag, a solid fill and a dense hatch. Any kind of mark uses any drawing; the pen says
 * which kind it is (K15). The strokes run past the box, as a quick hand does. The card's previews
 * draw the same paths.
 */
export const BOX_PATH =
  'M6.5 4.8C12.5 4.3 23.5 4.6 30.2 4.9C31.4 5 31.6 6.1 31.5 7.2C31.2 13.5 31.4 22.5 31.2 29.4C31.2 30.6 30.3 31.3 29.1 31.3C22.5 31.6 13 31.2 6.6 31.4C5.4 31.4 4.7 30.6 4.7 29.4C4.6 22.8 4.9 13 4.6 6.8C4.6 5.6 5.4 4.9 6.5 4.8Z'

export type Drawing = 'zigzag' | 'solid' | 'hatch'
export const DRAWINGS: readonly Drawing[] = ['zigzag', 'solid', 'hatch']

/** Each drawing's path, and whether it is filled (solid) or stroked 3.5 units (the scribbles). */
export const MARK_DRAWINGS: Record<Drawing, { d: string; filled: boolean }> = {
  zigzag: {
    d: 'M4 7.8L24 14.6L15.6 3.4L33.8 11.4M2.6 11.8L34 24.4L4 16.8L31.2 27.6L4.4 21.8L24.6 31.6L7 25.6L19.2 33.2',
    filled: false,
  },
  solid: {
    d: 'M3.7 5.1L31.5 5L32.5 6.6L33.1 12.1L33.1 21.8L32 31.3L29.8 32.4L14.2 32.3L6.6 33L2.6 30.6L4 28.9L3.5 22.4L3.9 14.7L3.4 6.7Z',
    filled: true,
  },
  hatch: {
    d: 'M12 4.2L33.4 14L8 6.6L33.2 20.4L5.6 9.6L32.2 24.8L4.8 13.6L30.2 28.8L4.4 18L27 31.2L4 22.6L20.4 32L5.2 27.2L12.4 32.2',
    filled: false,
  },
}

/**
 * Which drawing a day's mark uses: picked from the row and the date (FNV-1a), so the grid looks
 * filled by hand and a day keeps its drawing on every render, in the week and in the Today list.
 */
export function markDrawing(name: string, date: string): Drawing {
  let hash = 0x811c9dc5
  for (const ch of `${name}\n${date}`) {
    hash ^= ch.codePointAt(0)!
    hash = Math.imul(hash, 0x01000193)
  }
  return DRAWINGS[(hash >>> 0) % DRAWINGS.length]!
}

/** Each mark's pen, as the text colour its drawing strokes and fills with (DayMark card). */
export const MARK_PENS: Record<Mark, string> = {
  great: 'text-pen',
  partial: 'text-pen-partial',
  missed: 'text-pen-missed',
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
