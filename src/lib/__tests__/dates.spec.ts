import { describe, expect, it } from 'vitest'
import {
  dateKey,
  dayMonth,
  fullDate,
  mondayOf,
  weekDates,
  weekOf,
  weekRange,
  weekTitle,
} from '@/lib/dates'

describe('mondayOf', () => {
  it('returns the same day at midnight for a Monday', () => {
    const m = mondayOf(new Date(2026, 9, 19, 15, 30))
    expect(dateKey(m)).toBe('2026-10-19')
    expect(m.getHours()).toBe(0)
  })

  it('maps Sunday back to the preceding Monday (weeks are Mon–Sun)', () => {
    expect(dateKey(mondayOf(new Date(2026, 9, 25)))).toBe('2026-10-19')
  })

  it('shifts by whole weeks with an offset', () => {
    const now = new Date(2026, 9, 23)
    expect(dateKey(mondayOf(now, -1))).toBe('2026-10-12')
    expect(dateKey(mondayOf(now, 2))).toBe('2026-11-02')
  })

  it('crosses a year boundary', () => {
    expect(dateKey(mondayOf(new Date(2027, 0, 2)))).toBe('2026-12-28')
  })
})

describe('dateKey', () => {
  it('zero-pads month and day', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('weekDates', () => {
  it('returns seven consecutive days, including across a DST change', () => {
    const keys = weekDates(new Date(2026, 9, 19)).map(dateKey)
    expect(keys).toEqual([
      '2026-10-19',
      '2026-10-20',
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-25',
    ])
  })
})

describe('weekTitle', () => {
  const now = new Date(2026, 9, 23)

  it('is the Header’s week label within this year', () => {
    expect(weekTitle(new Date(2026, 9, 19), now)).toBe('19–25 October')
    expect(weekTitle(new Date(2026, 8, 28), now)).toBe('28 Sept – 4 Oct')
  })

  it('adds the Sunday’s year when the week ends in another year', () => {
    expect(weekTitle(new Date(2026, 11, 28), now)).toBe('28 Dec – 3 Jan 2027')
    expect(weekTitle(new Date(2025, 9, 20), now)).toBe('20–26 October 2025')
    // Seen from the new year, the week that started in December is this year's.
    expect(weekTitle(new Date(2026, 11, 28), new Date(2027, 0, 2))).toBe('28 Dec – 3 Jan')
  })
})

describe('weekOf', () => {
  it('names a week by its Monday, with the year only when it is not this year', () => {
    const now = new Date(2026, 9, 23)
    expect(weekOf(new Date(2026, 9, 19), now)).toBe('19 October')
    expect(weekOf(new Date(2025, 11, 29), now)).toBe('29 December 2025')
  })
})

describe('fullDate', () => {
  it('writes the weekday and the month in full, as a DayMark’s name does', () => {
    expect(fullDate(new Date(2026, 9, 22))).toBe('Thursday 22 October')
  })
})

describe('dayMonth', () => {
  it('writes the day before the whole month', () => {
    expect(dayMonth(new Date(2026, 9, 26))).toBe('26 October')
  })
})

describe('weekRange', () => {
  it('names the month once within a month', () => {
    expect(weekRange(new Date(2026, 9, 19))).toBe('19–25 October')
  })

  it('shortens both months across a month or a year', () => {
    expect(weekRange(new Date(2026, 8, 28))).toBe('28 Sept – 4 Oct')
    expect(weekRange(new Date(2026, 11, 28))).toBe('28 Dec – 3 Jan')
  })
})
