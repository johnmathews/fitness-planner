import { describe, expect, it } from 'vitest'
import { countOf, durationText, numberWord } from '../words'
import { APP_NAME } from '../app'

describe('numberWord', () => {
  it('writes zero to ten as words and larger numbers as figures', () => {
    expect(numberWord(0)).toBe('zero')
    expect(numberWord(2)).toBe('two')
    expect(numberWord(10)).toBe('ten')
    expect(numberWord(11)).toBe('11')
  })

  it('capitalises a word that opens a sentence, and leaves figures alone', () => {
    expect(numberWord(2, true)).toBe('Two')
    expect(numberWord(12, true)).toBe('12')
  })
})

describe('countOf', () => {
  it('uses the singular for one and the plural otherwise', () => {
    expect(countOf(1, 'change')).toBe('one change')
    expect(countOf(2, 'change', true)).toBe('Two changes')
    expect(countOf(12, 'change')).toBe('12 changes')
  })
})

describe('the app name', () => {
  it('is Tracker (K44)', () => {
    expect(APP_NAME).toBe('Tracker')
  })
})

describe('durationText', () => {
  it('reads seconds under a minute, whole minutes, and minutes with seconds', () => {
    expect(durationText(5)).toBe('5 s')
    expect(durationText(60)).toBe('1 min')
    expect(durationText(90)).toBe('1 min 30 s')
    expect(durationText(3600)).toBe('60 min')
  })
})
