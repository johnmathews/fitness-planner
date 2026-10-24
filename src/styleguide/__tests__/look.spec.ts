import { afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_INK, INKS } from '@/lib/inks'
import { applyLook, inkById, lookSearch, readLook } from '../look'

describe('readLook', () => {
  it('takes the theme and ink from the query', () => {
    expect(readLook('?theme=dark&ink=violet', false)).toEqual({ theme: 'dark', ink: 'violet' })
    expect(readLook('?theme=light&ink=forest', true)).toEqual({ theme: 'light', ink: 'forest' })
  })

  it("keeps the page's theme and uses Ink blue when the query says nothing usable", () => {
    expect(readLook('', true)).toEqual({ theme: 'dark', ink: 'ink-blue' })
    expect(readLook('?theme=sepia&ink=orange', false)).toEqual({ theme: 'light', ink: 'ink-blue' })
  })
})

describe('lookSearch', () => {
  it('round-trips through readLook', () => {
    const look = { theme: 'dark', ink: 'graphite' } as const
    expect(lookSearch(look)).toBe('?theme=dark&ink=graphite')
    expect(readLook(lookSearch(look), false)).toEqual(look)
  })
})

describe('inkById', () => {
  it('finds an ink, or falls back to the default', () => {
    expect(inkById('forest')).toBe(INKS[1])
    expect(inkById(null)).toBe(DEFAULT_INK)
  })
})

describe('applyLook', () => {
  const root = document.documentElement
  afterEach(() => {
    root.classList.remove('dark')
    root.removeAttribute('style')
  })

  it('sets the dark class and both pen variables, as App.vue does', () => {
    applyLook(root, { theme: 'dark', ink: 'violet' })
    expect(root.classList.contains('dark')).toBe(true)
    expect(root.style.getPropertyValue('--user-pen-light')).toBe('#4b3b7a')
    expect(root.style.getPropertyValue('--user-pen-dark')).toBe('#b9a9e8')

    applyLook(root, { theme: 'light', ink: 'ink-blue' })
    expect(root.classList.contains('dark')).toBe(false)
    expect(root.style.getPropertyValue('--user-pen-light')).toBe('#2b4c7e')
  })
})
