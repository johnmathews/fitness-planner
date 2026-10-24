import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DEFAULT_INK, INKS, inkFor, type InkId } from '@/lib/inks'

type ColorToken = { name: string; value: { light: string; dark: string } }
// The design system is the source of the ink values (jsdom gives import.meta.url an http: scheme).
const tokens = JSON.parse(
  readFileSync(
    join(import.meta.dirname, '../../../brand/design-system/project/tokens.json'),
    'utf8',
  ),
) as { color: { tokens: ColorToken[] } }

function id(accent: string, saved = true): InkId {
  return inkFor(accent, saved).id
}

describe('INKS', () => {
  it('are the four inks of the design system, Ink blue first, with its values', () => {
    expect(INKS.map((ink) => ink.id)).toEqual(['ink-blue', 'forest', 'violet', 'graphite'])
    expect(INKS.map((ink) => ink.name)).toEqual(['Ink blue', 'Forest', 'Violet', 'Graphite'])
    for (const ink of INKS) {
      const token = tokens.color.tokens.find((t) => t.name === ink.id)
      // The id rides along so a mismatch names the ink.
      expect([ink.id, token?.value]).toEqual([ink.id, { light: ink.light, dark: ink.dark }])
    }
    expect(DEFAULT_INK.id).toBe('ink-blue')
  })
})

describe('inkFor', () => {
  it('gives Ink blue when no settings are saved, whatever the stored default', () => {
    expect(id('#30d158', false)).toBe('ink-blue')
    expect(id('#4b3b7a', false)).toBe('ink-blue')
  })

  it('maps each saved legacy accent per K3', () => {
    expect(id('#0a84ff')).toBe('ink-blue')
    expect(id('#ff9f0a')).toBe('ink-blue')
    expect(id('#30d158')).toBe('forest')
    expect(id('#bf5af2')).toBe('violet')
  })

  it('gives each ink for its own light hex, in either case', () => {
    for (const ink of INKS) {
      expect(id(ink.light)).toBe(ink.id)
      expect(id(ink.light.toUpperCase())).toBe(ink.id)
    }
    expect(id('#30D158')).toBe('forest')
    expect(id('#FF9F0A')).toBe('ink-blue')
  })

  it('falls back to Ink blue for any other colour, and for anything that is not one', () => {
    expect(id('#123456')).toBe('ink-blue')
    // An ink's dark value is never stored: choosing an ink stores its light hex.
    expect(id('#8fcbaa')).toBe('ink-blue')
    for (const junk of ['', 'forest', '#2f5d4', '#2f5d466', '2f5d46', ' #2f5d46']) {
      expect([junk, id(junk)]).toEqual([junk, 'ink-blue'])
    }
  })

  it('returns the ink itself, so its light and dark values can be applied', () => {
    expect(inkFor('#bf5af2', true)).toEqual({
      id: 'violet',
      name: 'Violet',
      light: '#4b3b7a',
      dark: '#b9a9e8',
    })
  })
})
