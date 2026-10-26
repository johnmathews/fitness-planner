import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Dialog } from './Dialog.vue'

/**
 * The layer behind a modal (Dialog and ConfirmDialog cards): `scrim` with the 40% opacity on the
 * layer, never on the colour, so the token stays the one source. It fades in over 120ms, and
 * appears at once under reduced motion. Overlays don't print.
 */
export const scrimVariants = cva([
  'fixed inset-0 z-50 bg-scrim opacity-40 print:hidden',
  'motion-safe:transition-opacity motion-safe:duration-120 motion-safe:ease-out starting:opacity-0',
])

/**
 * A modal panel: panel fill, 1px line border (the edge in dark, where there is no shadow),
 * radius-lg, the overlay shadow, at the page's size (K55): max(24px, 32u) padding (space-4 below
 * 640px). Centred without a transform, 16px from each edge of a phone, and scrolling inside when
 * taller than the screen. It appears without slide, scale or bounce. md is the Dialog's
 * max(416px, 720u), sm the ConfirmDialog's max(400px, 600u).
 */
export const dialogPanelVariants = cva(
  [
    'fixed inset-0 z-50 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto',
    'rounded-lg border border-line bg-panel p-4 text-ink shadow-overlay sm:p-[max(24px,calc(var(--u)*32))] print:hidden',
  ],
  {
    variants: {
      size: {
        md: 'max-w-[max(26rem,calc(var(--u)*720))]',
        sm: 'max-w-[max(25rem,calc(var(--u)*600))]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type DialogPanelVariants = VariantProps<typeof dialogPanelVariants>
