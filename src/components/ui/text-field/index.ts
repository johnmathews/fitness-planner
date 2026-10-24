import { cva } from 'class-variance-authority'

export { default as TextField } from './TextField.vue'

/**
 * The input's skin (brand/design-system/project/components/TextField): 44px tall, panel fill,
 * 1px control border that darkens to ink on hover and turns error-ink when invalid, radius-sm,
 * body text in ink with tabular figures. Focus is the global solid 2px outline (main.css).
 */
export const textFieldVariants = cva([
  'h-11 w-full min-w-0 rounded-sm border border-control-border bg-panel px-3',
  'font-sans text-base text-ink tabular-nums placeholder:text-ink-secondary',
  'hover:not-aria-invalid:border-ink aria-invalid:border-error-ink disabled:cursor-not-allowed',
  'motion-safe:transition-[color,background-color,border-color] motion-safe:duration-120 motion-safe:ease-out',
])
