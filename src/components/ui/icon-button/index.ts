import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as IconButton } from './IconButton.vue'

/**
 * The icon-only button (brand/design-system/project/components/IconButton): a 44px square on
 * every layout, ink icon, tile on hover and while what it opens is open (aria-expanded). Quiet
 * has no border; outlined draws the control border. Only `disabled` fades, to 40%.
 */
export const iconButtonVariants = cva(
  [
    'inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-transparent',
    'bg-transparent p-0 text-ink hover:not-disabled:bg-tile aria-expanded:bg-tile',
    'disabled:cursor-not-allowed disabled:opacity-40',
    'motion-safe:transition-colors motion-safe:duration-120 motion-safe:ease-out',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        quiet: '',
        outlined: 'border-control-border',
      },
    },
    defaultVariants: {
      variant: 'quiet',
    },
  },
)

export type IconButtonVariants = VariantProps<typeof iconButtonVariants>
