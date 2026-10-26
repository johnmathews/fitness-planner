import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as BrandMark } from './BrandMark.vue'

/**
 * The product's name as a mark (brand/design-system/project/components/BrandMark): the outlined
 * Source Serif 4 wordmark. There is no monogram (K44). Only ever `ink`. md is the Header's 20px,
 * lg the sign-in card's 32px; never below 16px.
 */
export const brandMarkVariants = cva('block w-auto shrink-0 fill-current text-ink', {
  variants: {
    size: {
      md: 'h-5',
      lg: 'h-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type BrandMarkVariants = VariantProps<typeof brandMarkVariants>
