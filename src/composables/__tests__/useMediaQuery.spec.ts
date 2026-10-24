import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { useMediaQuery } from '@/composables/useMediaQuery'

/** A MediaQueryList that test code can flip, recording its listeners. */
function fakeQuery(matches: boolean) {
  type Listener = (ev: MediaQueryListEvent) => void
  const listeners = new Set<Listener>()
  const list = {
    matches,
    addEventListener: (_: string, fn: Listener) => listeners.add(fn),
    removeEventListener: (_: string, fn: Listener) => listeners.delete(fn),
  }
  function change(next: boolean): void {
    for (const fn of listeners) fn({ matches: next } as MediaQueryListEvent)
  }
  return { list, listeners, change }
}

afterEach(() => vi.unstubAllGlobals())

describe('useMediaQuery', () => {
  it('starts from the query, follows its changes, and stops listening with its scope', () => {
    const q = fakeQuery(true)
    const matchMedia = vi.fn<(query: string) => typeof q.list>(() => q.list)
    vi.stubGlobal('matchMedia', matchMedia)
    const scope = effectScope()
    const matches = scope.run(() => useMediaQuery('(width < 40rem)'))!
    expect(matchMedia).toHaveBeenCalledWith('(width < 40rem)')
    expect(matches.value).toBe(true)
    q.change(false)
    expect(matches.value).toBe(false)
    q.change(true)
    expect(matches.value).toBe(true)

    scope.stop()
    expect(q.listeners.size).toBe(0)
    q.change(false)
    expect(matches.value).toBe(true)
  })

  it('is false, and safe, where matchMedia is missing (jsdom)', () => {
    vi.stubGlobal('matchMedia', undefined)
    const scope = effectScope()
    const matches = scope.run(() => useMediaQuery('(prefers-color-scheme: dark)'))!
    expect(matches.value).toBe(false)
    expect(() => scope.stop()).not.toThrow()
  })
})
