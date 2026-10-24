import { cva } from 'class-variance-authority'

export { default as TextArea } from './TextArea.vue'

/**
 * The textarea's skin (brand/design-system/project/components/TextArea): TextField's panel fill,
 * control border, radius-sm and body text, at least 104px (four lines) tall and resizable
 * vertically only. Focus is the global solid 2px outline (main.css).
 */
export const textAreaVariants = cva([
  'block min-h-26 w-full min-w-0 resize-y rounded-sm border border-control-border bg-panel px-3 py-2.5',
  'font-sans text-base text-ink placeholder:text-ink-secondary',
  'hover:not-aria-invalid:border-ink aria-invalid:border-error-ink disabled:cursor-not-allowed',
  'motion-safe:transition-colors motion-safe:duration-120 motion-safe:ease-out',
])
