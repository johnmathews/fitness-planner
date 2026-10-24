import { cva } from 'class-variance-authority'

export { default as Switch } from './Switch.vue'

/**
 * The Switch row (brand/design-system/project/components/Switch): a 44px role="switch" button
 * holding the label in body ink and the track, with a tile on hover. Only colours transition;
 * the thumb moves without animation. Focus is the global solid 2px outline round the row
 * (main.css). Only `disabled` fades, to 40%.
 */
export const switchVariants = cva([
  'group/switch inline-flex h-11 shrink-0 items-center gap-3 rounded-md bg-transparent px-2',
  'body text-ink whitespace-nowrap hover:not-disabled:bg-tile',
  'disabled:cursor-not-allowed disabled:opacity-40',
  'motion-safe:transition-[color,background-color,border-color] motion-safe:duration-120 motion-safe:ease-out',
])

/** The 40 × 24 track: control border when off, ink fill and border when on (never the pen). */
export const switchTrackVariants = cva([
  'relative box-border h-6 w-10 flex-none rounded-full border border-control-border',
  'group-data-[state=checked]/switch:border-ink group-data-[state=checked]/switch:bg-ink',
  'motion-safe:transition-[color,background-color,border-color] motion-safe:duration-120 motion-safe:ease-out',
])

/** The 16px thumb: ink-secondary at the left when off, on-ink at the right when on. */
export const switchThumbVariants = cva([
  'absolute top-[3px] left-[3px] block size-4 rounded-full bg-ink-secondary',
  'data-[state=checked]:translate-x-4 data-[state=checked]:bg-on-ink',
  'motion-safe:transition-[color,background-color,border-color] motion-safe:duration-120 motion-safe:ease-out',
])
