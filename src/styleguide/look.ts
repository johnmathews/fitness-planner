/**
 * How the style guide is drawn: the theme. It sets it on <html> the way the app does (App.vue and
 * public/theme-init.js), with the `.dark` class. The query string carries it (`?theme=dark`), so a
 * browser test can open either theme directly.
 */
export type LookTheme = 'light' | 'dark'

export interface Look {
  theme: LookTheme
}

/**
 * The look a query string asks for. A missing or unknown theme keeps the one already on the page
 * (theme-init.js set it from the saved setting or the OS).
 */
export function readLook(search: string, pageIsDark: boolean): Look {
  const theme = new URLSearchParams(search).get('theme')
  return { theme: theme === 'light' || theme === 'dark' ? theme : pageIsDark ? 'dark' : 'light' }
}

/** The query string for a look, so the address bar always reopens what is on screen. */
export function lookSearch(look: Look): string {
  return `?${new URLSearchParams({ theme: look.theme })}`
}

/** Draws the page in a look: the same class App.vue sets. */
export function applyLook(root: HTMLElement, look: Look): void {
  root.classList.toggle('dark', look.theme === 'dark')
}
