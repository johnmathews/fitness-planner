import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { StatFigure, statState } from '@/components/ui/stat-figure'

describe('StatFigure', () => {
  it('reads as one sentence: the figure, then what it counts', () => {
    const wrapper = mount(StatFigure, {
      props: { figure: 10, total: 12, words: 'this week', met: false },
    })
    expect(wrapper.element.tagName).toBe('P')
    expect(wrapper.text()).toBe('10 of 12 this week')
    expect(wrapper.attributes('aria-live')).toBeUndefined()
  })

  it('sets a figure not met yet in ink at 600, tabular', () => {
    const wrapper = mount(StatFigure, {
      props: { figure: 10, total: 12, words: 'this week', met: false },
    })
    expect(wrapper.attributes('data-state')).toBe('unmet')
    const fig = wrapper.get('[data-slot="stat-figure-value"]')
    expect(fig.classes()).toEqual(
      expect.arrayContaining(['text-ink', 'font-semibold', 'tabular-nums']),
    )
    expect(wrapper.get('[data-slot="stat-figure-words"]').classes()).toEqual(
      expect.arrayContaining(['body-large', 'text-ink-secondary']),
    )
    expect(wrapper.find('[data-slot="met-mark"]').exists()).toBe(false)
  })

  it('sets a met figure in pen and adds a check, so it never rests on colour (F6)', () => {
    const wrapper = mount(StatFigure, {
      props: { figure: 13, total: 12, words: 'this week', met: true },
    })
    expect(wrapper.attributes('data-state')).toBe('met')
    expect(wrapper.get('[data-slot="stat-figure-value"]').classes()).toContain('text-pen')
    const check = wrapper.get('[data-slot="met-mark"]')
    expect(check.attributes('aria-hidden')).toBe('true')
    expect(check.attributes('width')).toBe('16')
  })

  it('keeps zero quiet, in ink-secondary at 400, even when "met" (F13)', () => {
    const wrapper = mount(StatFigure, {
      props: { figure: 0, total: 0, words: 'goals met', met: true },
    })
    expect(wrapper.attributes('data-state')).toBe('zero')
    const fig = wrapper.get('[data-slot="stat-figure-value"]')
    expect(fig.classes()).toEqual(expect.arrayContaining(['text-ink-secondary', 'font-normal']))
    expect(wrapper.html()).not.toContain('text-pen')
    expect(wrapper.find('[data-slot="met-mark"]').exists()).toBe(false)
  })

  it('names the state the same way for other figures', () => {
    expect(statState(0, true)).toBe('zero')
    expect(statState(3, true)).toBe('met')
    expect(statState(3, false)).toBe('unmet')
  })
})
