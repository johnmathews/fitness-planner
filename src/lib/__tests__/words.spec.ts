import { describe, expect, it } from 'vitest'
import { countOf, numberWord } from '../words'
import { APP_MONOGRAM, APP_NAME } from '../app'

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
  it('is the working name, with its initials as the monogram', () => {
    expect(APP_NAME).toBe('Fitness Planner')
    expect(APP_MONOGRAM).toBe('FP')
  })
})
