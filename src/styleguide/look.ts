import { DEFAULT_INK, INKS, type Ink, type InkId } from '@/lib/inks'

/**
 * How the style guide is drawn: the theme and the ink. It sets them on <html> the way the app
 * does (App.vue and public/theme-init.js): the `.dark` class, and the two pen variables main.css
 * picks `--pen` from. The query string carries them (`?theme=dark&ink=forest`), so a browser test
 * can open any combination directly.
 */
export type LookTheme = 'light' | 'dark'

export interface Look {
  theme: LookTheme
  ink: InkId
}

/** The ink with this id, or the default ink. */
export function inkById(id: string | null): Ink {
  return INKS.find((ink) => ink.id === id) ?? DEFAULT_INK
}

/**
 * The look a query string asks for. A missing or unknown theme keeps the one already on the page
 * (theme-init.js set it from the saved setting or the OS); a missing or unknown ink is Ink blue.
 */
export function readLook(search: string, pageIsDark: boolean): Look {
  const params = new URLSearchParams(search)
  const theme = params.get('theme')
  return {
    theme: theme === 'light' || theme === 'dark' ? theme : pageIsDark ? 'dark' : 'light',
    ink: inkById(params.get('ink')).id,
  }
}

/** The query string for a look, so the address bar always reopens what is on screen. */
export function lookSearch(look: Look): string {
  return `?${new URLSearchParams({ theme: look.theme, ink: look.ink })}`
}

/** Draws the page in a look: the same class and variables App.vue sets. */
export function applyLook(root: HTMLElement, look: Look): void {
  const ink = inkById(look.ink)
  root.classList.toggle('dark', look.theme === 'dark')
  root.style.setProperty('--user-pen-light', ink.light)
  root.style.setProperty('--user-pen-dark', ink.dark)
}
