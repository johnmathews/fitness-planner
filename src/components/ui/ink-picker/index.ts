import { cva } from 'class-variance-authority'
import type { InkId } from '@/lib/inks'

export { default as InkPicker } from './InkPicker.vue'

/**
 * The ink rows (brand/design-system/project/components/InkPicker): two columns where each row
 * gets at least 152px, one column otherwise (as in the 296px Settings popover).
 */
export const inkPickerVariants = cva(
  'grid grid-cols-[repeat(auto-fill,minmax(152px,1fr))] gap-x-2 gap-y-1',
)

/**
 * One ink: a 44px row with a 24px dot, the name and a check slot, a tile on hover. The chosen
 * row (data-state=checked) rings its dot in ink, shows the check and sets its name at 600, so it
 * never relies on colour alone. Focus is the global solid 2px outline round the row (main.css).
 */
export const inkOptionVariants = cva([
  'group/ink flex h-11 min-w-0 items-center gap-3 rounded-md bg-transparent pr-2 pl-3 text-left',
  'text-base leading-6 text-ink hover:bg-tile',
  'motion-safe:transition-[background-color] motion-safe:duration-120 motion-safe:ease-out',
])

/** The dot: each ink's own token, so it shows the value for the current theme. */
export const INK_DOT: Record<InkId, string> = {
  'ink-blue': 'bg-(--ink-blue)',
  forest: 'bg-(--forest)',
  violet: 'bg-(--violet)',
  graphite: 'bg-(--graphite)',
}
