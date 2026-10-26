import { describe, expect, it } from 'vitest'
import { MARKS, normaliseExercise, normaliseFood } from '@/lib/storage'
import { CACHE_PREFIX, OLD_CACHE_PREFIXES, OLD_OUTBOX_PREFIXES, OUTBOX_PREFIX } from '@/stores/sync'

/**
 * K14 as a test: the cache and outbox keys carry a version, and a change to what they store takes
 * the next one. A tab still open on older code shares the browser's storage; it reads a value it
 * doesn't know as empty and writes its copy back, emptying the newer tab's marks. That happened
 * twice (journal 261025-stale-tab, and the solid and hatch drawings of #38).
 *
 * Each row records what one version stores. A row may change only before its version ships.
 */
const FORMATS: Record<string, { marks: string[]; exercise: string[]; food: string[] }> = {
  'tracker-cache-v3:': {
    marks: [
      'great',
      'partial',
      'missed',
      'great-solid',
      'partial-solid',
      'missed-solid',
      'great-hatch',
      'partial-hatch',
      'missed-hatch',
    ],
    exercise: ['duration', 'id', 'name', 'notes', 'perSide', 'reps', 'sets', 'target', 'weight'],
    food: ['id', 'name', 'notes', 'target'],
  },
}

/** The fields a normaliser keeps from an item with every field set, and one it should drop. */
function keptFields(normalise: (v: unknown) => object | null): string[] {
  const full = {
    id: 'x',
    name: 'Squats',
    sets: 3,
    reps: 10,
    duration: 30,
    perSide: true,
    weight: 12,
    target: 3,
    notes: 'a note',
    probe: 'not a field',
  }
  return Object.keys(normalise(full) ?? {}).sort()
}

describe('the stored format (K14)', () => {
  const format = FORMATS[CACHE_PREFIX]

  it('has a row for the current cache key', () => {
    expect(format, `add a FORMATS row for ${CACHE_PREFIX}`).toBeDefined()
  })

  it('stores what the row for the current key says; a change takes a new key', () => {
    const now = {
      marks: [...MARKS],
      exercise: keptFields(normaliseExercise),
      food: keptFields(normaliseFood),
    }
    expect(
      now,
      `the stored format changed: bump CACHE_PREFIX and OUTBOX_PREFIX (K14), move the old names to the front of OLD_*_PREFIXES, and add a FORMATS row`,
    ).toEqual(format)
  })

  it('moves every earlier name, and the cache and outbox share a version', () => {
    const version = (prefix: string) => prefix.match(/-v(\d+):$/)![1]
    expect(version(OUTBOX_PREFIX)).toBe(version(CACHE_PREFIX))
    const current = Number(version(CACHE_PREFIX))
    const olds = (prefixes: readonly string[]) => prefixes.map((p) => Number(version(p)))
    const expected = Array.from({ length: current - 1 }, (_, i) => current - 1 - i)
    expect(olds(OLD_CACHE_PREFIXES)).toEqual(expected)
    expect(olds(OLD_OUTBOX_PREFIXES)).toEqual(expected)
  })
})
