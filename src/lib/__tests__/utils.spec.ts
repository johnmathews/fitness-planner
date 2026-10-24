import { describe, expect, it } from 'vitest'
import { cn, joinIds } from '@/lib/utils'

describe('cn', () => {
  it('joins conditional classes and lets the later of two conflicting utilities win', () => {
    const hidden = false
    expect(cn('h-11 px-4', { hidden }, 'px-6')).toBe('h-11 px-6')
  })

  it('keeps role colours apart from text sizes', () => {
    expect(cn('text-base text-ink', 'text-on-ink')).toBe('text-base text-on-ink')
  })
})

describe('joinIds', () => {
  it('joins the ids that are present with spaces', () => {
    expect(joinIds('a', undefined, '', 'b', null, false)).toBe('a b')
  })

  it('is undefined when no id is present, so the attribute is left off', () => {
    expect(joinIds(undefined, '')).toBeUndefined()
  })
})
