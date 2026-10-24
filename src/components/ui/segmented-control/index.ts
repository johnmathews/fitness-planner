import { cva } from 'class-variance-authority'

export { default as SegmentedControl } from './SegmentedControl.vue'

/**
 * The control's outline (brand/design-system/project/components/SegmentedControl): a 1px control
 * border with radius-md, 44px tall overall with no inset, wrapping onto a second line on a
 * narrow phone rather than shrinking its type. Disabled fades the whole control to 40%.
 */
export const segmentedControlVariants = cva([
  'inline-flex max-w-full flex-wrap rounded-md border border-control-border',
  'aria-disabled:opacity-40',
])

/**
 * One segment: 42px tall, space-4 padding, radius-sm, `label` type (14/20 600) in ink whether
 * chosen or not, so the width never jumps. The chosen one is ink with on-ink text, like the
 * primary Button (never the pen); unchosen ones take a tile on hover. Its focus outline (the
 * global solid 2px) is lifted above its neighbours.
 */
export const segmentVariants = cva([
  'relative h-[42px] rounded-sm bg-transparent px-4 label text-ink whitespace-nowrap',
  'aria-pressed:bg-ink aria-pressed:text-on-ink hover:not-aria-pressed:not-disabled:bg-tile',
  'focus-visible:z-10 disabled:cursor-not-allowed',
  'motion-safe:transition-[color,background-color,border-color] motion-safe:duration-120 motion-safe:ease-out',
])
