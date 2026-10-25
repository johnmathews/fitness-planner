import { cva } from 'class-variance-authority'

export { default as RadioCard } from './RadioCard.vue'

/**
 * One choice (brand/design-system/project/components/RadioCard): a row at least 76px tall with a
 * 1px control-border outline and radius-md, the dot, the name and the option's picture space-3
 * apart. The chosen row's outline is 2px ink, its padding a pixel less so nothing moves; an
 * unchosen row takes a tile on hover. Below 640px the picture wraps under the name. The focus
 * outline is the global solid 2px.
 */
export const radioCardVariants = cva([
  'group flex min-h-19 w-full items-center gap-3 rounded-md border border-control-border',
  'bg-transparent px-3 py-1 text-left text-ink',
  'aria-checked:border-2 aria-checked:border-ink aria-checked:px-[11px] aria-checked:py-[3px]',
  'hover:not-aria-checked:bg-tile',
  'max-sm:flex-wrap max-sm:py-2 max-sm:aria-checked:py-[7px]',
  'motion-safe:transition-[background-color] motion-safe:duration-120 motion-safe:ease-out',
])

/** The radio dot: a 20px ring in control-border, 2px ink when chosen, with a 10px ink dot. */
export const radioDotVariants = cva([
  'grid size-5 shrink-0 place-items-center rounded-full border border-control-border',
  'group-aria-checked:border-2 group-aria-checked:border-ink',
])

/** The picture: on the right, or under the name below 640px, lined up with it. */
export const radioPictureVariants = cva(['flex gap-3 max-sm:w-full max-sm:pl-8'])
