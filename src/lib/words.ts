const WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
]

/**
 * A count as the voice writes it in a sentence (voice.md): small numbers as words ("two") and
 * figures from 11 up ("12"). `start` capitalises it to open a sentence ("Two"). Grids and totals
 * keep their figures and don't use this.
 */
export function numberWord(n: number, start = false): string {
  const word = WORDS[n] ?? String(n)
  return start ? word.charAt(0).toUpperCase() + word.slice(1) : word
}

/** "one change", "two changes", "12 changes"; `start` gives "One change". */
export function countOf(n: number, singular: string, start = false): string {
  return `${numberWord(n, start)} ${n === 1 ? singular : `${singular}s`}`
}

/** A timed set in the Chip card's words: "45 s", "2 min", "1 min 30 s". */
export function durationText(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const s = seconds % 60
  if (!min) return `${s} s`
  return s ? `${min} min ${s} s` : `${min} min`
}
