/**
 * Class merging for the shadcn-vue components in src/components/ui: joins conditional classes and
 * resolves Tailwind conflicts, so a consumer's `class` wins over a component's default.
 */
export { cn } from 'cn'

/**
 * Joins the ids that are present into one `aria-describedby` value, or undefined when none is,
 * so the attribute is left off rather than rendered empty.
 */
export function joinIds(...ids: unknown[]): string | undefined {
  const present = ids.filter((id): id is string => typeof id === 'string' && id !== '')
  return present.length > 0 ? present.join(' ') : undefined
}
