import { cva } from 'class-variance-authority'

export { default as Popover } from './Popover.vue'

/**
 * The popover panel (brand/design-system/project/components/Popover): panel fill, 1px line
 * border, radius-lg, the overlay shadow (none in dark), space-4 padding, 296px wide but never
 * wider than the screen allows, and never taller: on a short phone the panel scrolls, so its last
 * control (Sign out) stays reachable. It appears with at most a 120ms fade, none under reduced
 * motion, and doesn't print.
 */
export const popoverVariants = cva([
  'z-50 w-74 max-w-(--reka-popover-content-available-width) rounded-lg border border-line',
  'max-h-(--reka-popover-content-available-height) overflow-y-auto overscroll-contain',
  'bg-panel p-4 text-ink shadow-overlay print:hidden',
  'motion-safe:transition-opacity motion-safe:duration-120 motion-safe:ease-out starting:opacity-0',
])
