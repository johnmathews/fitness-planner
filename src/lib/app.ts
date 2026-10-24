/**
 * The product's name, in the one place the code holds it (brand spec §6): the BrandMark's
 * accessible name and monogram, and the page title (vite.config.ts writes it into index.html).
 * "Fitness Planner" is the working name; when it changes, regenerate the wordmark outline with
 * scripts/wordmark.py and copy its path into src/components/ui/brand-mark/wordmark.ts.
 */
export const APP_NAME = 'Fitness Planner'

/** The monogram for small spaces: the name's initials ("FP"). */
export const APP_MONOGRAM = APP_NAME.split(/\s+/)
  .map((word) => word.charAt(0))
  .join('')
  .toUpperCase()
