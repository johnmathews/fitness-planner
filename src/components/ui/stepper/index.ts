import { cva } from 'class-variance-authority'

export { default as Stepper } from './Stepper.vue'

/**
 * The Stepper's outline (brand/design-system/project/components/Stepper): one 44px group with a
 * 1px control border and radius-md. The border is drawn by an overlay so the buttons inside keep
 * their full 44px height, and nothing here clips: no overflow on the group, so each part's 2px
 * focus outline shows on all four sides (F4). Disabled fades the whole group to 40%.
 */
export const stepperVariants = cva([
  'relative inline-flex h-11 items-stretch rounded-md text-ink data-disabled:opacity-40',
  'before:pointer-events-none before:absolute before:inset-0 before:rounded-md',
  'before:border before:border-control-border',
])

/**
 * The minus and plus buttons: 44px squares on every layout with a 20px ink icon and a tile on
 * hover. At a limit the button is aria-disabled (so keyboard focus stays on it) and its icon fades
 * to 40% with no hover fill. Focus is the global solid 2px outline (main.css).
 */
export const stepperButtonVariants = cva([
  'inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-transparent p-0 text-ink',
  'hover:not-aria-disabled:not-disabled:bg-tile aria-disabled:cursor-default',
  'aria-disabled:[&_svg]:opacity-40 disabled:cursor-not-allowed',
  'motion-safe:transition-[color,background-color,border-color] motion-safe:duration-120 motion-safe:ease-out',
  '[&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0',
])

/** The value between the buttons: body-large size at 600, tabular figures, so it never jumps. */
export const stepperValueVariants = cva([
  'h-11 w-12 min-w-0 rounded-sm border-0 bg-transparent px-1 text-center',
  'font-sans text-[17px] leading-6 font-semibold text-ink tabular-nums',
  'disabled:cursor-not-allowed',
])
