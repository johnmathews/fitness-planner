import { cva } from 'class-variance-authority'

export { default as TextLink } from './TextLink.vue'

/**
 * The link (brand/design-system/project/components/TextLink): ink, a 1px underline at 3px offset
 * that thickens to 2px on hover, in the size of the surrounding text. Visited looks the same, and
 * there is no disabled link. Focus is the global solid 2px outline (main.css); the 2px radius
 * rounds its corners.
 */
export const textLinkVariants = cva(
  'rounded-[2px] text-ink underline decoration-1 underline-offset-3 hover:decoration-2',
)
