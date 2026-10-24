import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Banner } from './Banner.vue'

/**
 * The page-wide sync bar (brand/design-system/project/components/Banner). Neutral (offline,
 * loading): tile fill, line border. Error (a lost change): panel fill, error-ink border, with the
 * icon and the lead in error-ink and the sentence in ink. The tone shows in the fill, the border,
 * the icon and the words together, never in colour alone (F27). Nothing in it prints.
 */
export const bannerVariants = cva(
  [
    'flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border py-2 pr-2 pl-4 text-ink',
    'print:hidden',
  ],
  {
    variants: {
      tone: {
        neutral: 'border-line bg-tile',
        error:
          'border-error-ink bg-panel [&_[data-slot=banner-icon]]:text-error-ink [&_[data-slot=banner-lead]]:text-error-ink',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
)

export type BannerVariants = VariantProps<typeof bannerVariants>
export type BannerTone = NonNullable<BannerVariants['tone']>
