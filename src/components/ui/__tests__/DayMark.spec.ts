import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { DayMark, dayMarkLabel } from '@/components/ui/day-mark'

const PROPS = { name: 'Squats', date: 'Thursday 22 October', done: false }

describe('DayMark', () => {
  it('is a toggle button named by its row and full date, never by its state', () => {
    const button = mount(DayMark, { props: PROPS }).get('button')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBe('Squats, Thursday 22 October')
    expect(button.attributes('aria-pressed')).toBe('false')
    expect(button.attributes('aria-current')).toBeUndefined()
    expect(button.text()).toBe('')
  })

  it('says "today" in the name and sets aria-current, so today never rests on the band', () => {
    const wrapper = mount(DayMark, { props: { ...PROPS, done: true, today: true } })
    const button = wrapper.get('button')
    expect(button.attributes('aria-label')).toBe('Squats, Thursday 22 October, today')
    expect(button.attributes('aria-current')).toBe('date')
    expect(button.attributes('aria-pressed')).toBe('true')
    expect(wrapper.attributes('data-today')).toBe('true')
    // The band belongs to the grid's cell, not to the mark.
    expect(wrapper.classes()).not.toContain('bg-highlight')
  })

  it('draws a 24px ring when not done and a pen dot when done', async () => {
    const wrapper = mount(DayMark, { props: PROPS })
    const dot = () => wrapper.get('[data-slot="day-mark-dot"]')
    expect(dot().attributes('aria-hidden')).toBe('true')
    expect(dot().attributes('data-on')).toBe('false')
    expect(dot().classes()).toEqual(
      expect.arrayContaining(['size-6', 'rounded-full', 'border-[1.5px]', 'border-control-border']),
    )
    expect(dot().classes()).not.toContain('bg-pen')
    await wrapper.setProps({ done: true })
    expect(dot().attributes('data-on')).toBe('true')
    expect(dot().classes()).toEqual(expect.arrayContaining(['bg-pen', 'border-pen']))
  })

  it('centres a 44px button in a 56 × 60px cell, and changes colour in 120ms at most', () => {
    const wrapper = mount(DayMark, { props: PROPS })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['h-15', 'w-14', 'relative']))
    expect(wrapper.get('button').classes()).toContain('size-11')
    expect(wrapper.get('[data-slot="day-mark-dot"]').classes()).toContain(
      'motion-safe:duration-120',
    )
  })

  it('emits toggle on click', async () => {
    const wrapper = mount(DayMark, { props: PROPS })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  it('shows the folded corner and says "has a note" only when a note exists', async () => {
    const wrapper = mount(DayMark, { props: PROPS })
    expect(wrapper.find('[data-slot="note-mark"]').exists()).toBe(false)
    await wrapper.setProps({ note: true, today: true })
    const corner = wrapper.get('[data-slot="note-mark"]')
    expect(corner.attributes('aria-hidden')).toBe('true')
    expect(corner.classes()).toEqual(expect.arrayContaining(['absolute', 'top-0', 'right-0']))
    expect(wrapper.get('button').attributes('aria-label')).toBe(
      'Squats, Thursday 22 October, today, has a note',
    )
  })

  it('builds the name the same way for other views (TodayList)', () => {
    expect(dayMarkLabel({ name: 'Fish', date: 'Saturday 24 October' })).toBe(
      'Fish, Saturday 24 October',
    )
    expect(dayMarkLabel({ name: 'Fish', date: 'Saturday 24 October', note: true })).toBe(
      'Fish, Saturday 24 October, has a note',
    )
  })
})
