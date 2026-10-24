import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as BrandMark } from './BrandMark.vue'

/**
 * The product's name as a mark (brand/design-system/project/components/BrandMark): the outlined
 * Source Serif 4 wordmark, or the "FP" monogram set live in the serif at 600 for small spaces.
 * Only ever `ink`. md is the Header's 20px, lg the sign-in card's 32px; never below 16px.
 */
export const brandMarkVariants = cva('shrink-0 text-ink', {
  variants: {
    variant: {
      wordmark: 'block w-auto fill-current',
      monogram: 'inline-block font-serif font-semibold tracking-normal select-none',
    },
    size: {
      md: '',
      lg: '',
    },
  },
  compoundVariants: [
    { variant: 'wordmark', size: 'md', class: 'h-5' },
    { variant: 'wordmark', size: 'lg', class: 'h-8' },
    { variant: 'monogram', size: 'md', class: 'text-[20px] leading-6' },
    { variant: 'monogram', size: 'lg', class: 'text-[32px] leading-10' },
  ],
  defaultVariants: {
    variant: 'wordmark',
    size: 'md',
  },
})

export type BrandMarkVariants = VariantProps<typeof brandMarkVariants>
