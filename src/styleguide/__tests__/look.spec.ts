import { afterEach, describe, expect, it } from 'vitest'
import { applyLook, lookSearch, readLook } from '../look'

describe('readLook', () => {
  it('takes the theme from the query', () => {
    expect(readLook('?theme=dark', false)).toEqual({ theme: 'dark' })
    expect(readLook('?theme=light', true)).toEqual({ theme: 'light' })
  })

  it("keeps the page's theme when the query says nothing usable", () => {
    expect(readLook('', true)).toEqual({ theme: 'dark' })
    expect(readLook('?theme=sepia', false)).toEqual({ theme: 'light' })
  })
})

describe('lookSearch', () => {
  it('round-trips through readLook', () => {
    const look = { theme: 'dark' } as const
    expect(lookSearch(look)).toBe('?theme=dark')
    expect(readLook(lookSearch(look), false)).toEqual(look)
  })
})

describe('applyLook', () => {
  const root = document.documentElement
  afterEach(() => root.classList.remove('dark'))

  it('sets the dark class, as App.vue does', () => {
    applyLook(root, { theme: 'dark' })
    expect(root.classList.contains('dark')).toBe(true)
    applyLook(root, { theme: 'light' })
    expect(root.classList.contains('dark')).toBe(false)
  })
})
