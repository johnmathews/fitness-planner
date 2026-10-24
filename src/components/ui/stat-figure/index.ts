export { default as StatFigure } from './StatFigure.vue'

/** How a figure is drawn: zero quiet, met in pen with a check, otherwise ink. */
export type StatState = 'zero' | 'met' | 'unmet'

/**
 * Zero wins over met: a fresh week or a new account starts quiet, never in pen (F13). Going over
 * the goal is still met; there is no over state for a week (StatFigure card).
 */
export function statState(figure: number, met: boolean): StatState {
  if (figure === 0) return 'zero'
  return met ? 'met' : 'unmet'
}
