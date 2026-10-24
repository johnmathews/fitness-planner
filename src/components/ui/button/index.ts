import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

/**
 * The text button (brand/design-system/project/components/Button). Primary is ink with on-ink
 * text (K8), secondary is outlined with the control border, quiet has no border; the last two
 * take a tile on hover. md is 44px; sm is 36px from 640px up and 44px below, so every target on
 * a phone stays 44px. Focus is the global solid 2px outline (main.css). Busy keeps full colour
 * (only the cursor changes); only `disabled` fades, to 40%.
 */
export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-transparent',
    'font-sans font-semibold whitespace-nowrap select-none',
    'aria-busy:cursor-progress disabled:cursor-not-allowed disabled:opacity-40',
    'motion-safe:transition-colors motion-safe:duration-120 motion-safe:ease-out',
    '[&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-ink text-on-ink hover:not-disabled:bg-[color-mix(in_srgb,var(--ink)_82%,var(--canvas))]',
        secondary: 'border-control-border bg-transparent text-ink hover:not-disabled:bg-tile',
        quiet: 'bg-transparent text-ink hover:not-disabled:bg-tile',
      },
      size: {
        md: 'h-11 px-4 text-base',
        sm: 'h-11 px-4 text-base sm:h-9 sm:px-3 sm:text-sm',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
