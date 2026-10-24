/**
 * The inks a person can choose for the pen: the colour that means "done" (brand spec §4.1, K3).
 * Values and ids match the ink tokens in brand/design-system/project/tokens.json, so `var(--forest)`
 * and friends in the stylesheets are the same colours, switching with the theme.
 *
 * The stored setting keeps its wire format (K3a): any `#rrggbb`, with the old green as the default
 * for missing or invalid input, so the API, the export file and the fixtures do not change.
 * Choosing an ink stores its light hex; `inkFor` turns whatever is stored back into an ink.
 */
export type InkId = 'ink-blue' | 'forest' | 'violet' | 'graphite'

export interface Ink {
  id: InkId
  name: string
  /** The pen on the light theme, and the value stored when the ink is chosen. */
  light: string
  /** The pen on the dark theme. */
  dark: string
}

export const INKS: readonly Ink[] = [
  { id: 'ink-blue', name: 'Ink blue', light: '#2b4c7e', dark: '#9db8e8' },
  { id: 'forest', name: 'Forest', light: '#2f5d46', dark: '#8fcbaa' },
  { id: 'violet', name: 'Violet', light: '#4b3b7a', dark: '#b9a9e8' },
  { id: 'graphite', name: 'Graphite', light: '#3d3d3d', dark: '#cfcfcf' },
]

export const DEFAULT_INK: Ink = INKS[0]!

/**
 * The accents saved before inks existed (K3). Orange becomes Ink blue rather than an ink of its
 * own, because an orange pen could be mistaken for the over-the-pick colour.
 */
const LEGACY = new Map<string, InkId>([
  ['#0a84ff', 'ink-blue'],
  ['#ff9f0a', 'ink-blue'],
  ['#30d158', 'forest'],
  ['#bf5af2', 'violet'],
])

/**
 * The ink for a stored accent. With no saved settings the stored value is only the wire default,
 * so the person gets the spec's default, Ink blue. Otherwise a legacy accent maps per K3, an ink's
 * own light hex gives that ink, and anything else gives Ink blue. Hex case does not matter.
 */
export function inkFor(accent: string, saved: boolean): Ink {
  if (!saved) return DEFAULT_INK
  const hex = accent.toLowerCase()
  const id = LEGACY.get(hex) ?? INKS.find((ink) => ink.light === hex)?.id
  return INKS.find((ink) => ink.id === id) ?? DEFAULT_INK
}
