import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { BOX_PATH, DayMark, MARK_PATHS, MARK_STROKES, dayMarkLabel } from '@/components/ui/day-mark'
import { MARKS } from '@/lib/storage'

const PROPS = { name: 'Squats', date: 'Thursday 22 October', mark: null }

describe('DayMark', () => {
  it('is a toggle button named by its row and full date when empty', () => {
    const button = mount(DayMark, { props: PROPS }).get('button')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBe('Squats, Thursday 22 October')
    expect(button.attributes('aria-pressed')).toBe('false')
    expect(button.attributes('aria-current')).toBeUndefined()
    expect(button.text()).toBe('')
  })

  it('says "today" in the name and sets aria-current, so today never rests on the band', () => {
    const wrapper = mount(DayMark, { props: { ...PROPS, mark: 'great', today: true } })
    const button = wrapper.get('button')
    expect(button.attributes('aria-label')).toBe('Squats, Thursday 22 October, today')
    expect(button.attributes('aria-current')).toBe('date')
    expect(button.attributes('aria-pressed')).toBe('true')
    expect(wrapper.attributes('data-today')).toBe('true')
    // The band belongs to the grid's cell, not to the mark.
    expect(wrapper.classes()).not.toContain('bg-highlight')
  })

  it('draws an empty hand-drawn box, and a stroke of its own shape and pen for each mark', async () => {
    const wrapper = mount(DayMark, { props: PROPS })
    const box = () => wrapper.get('[data-slot="day-mark-box"]')
    const outline = () => wrapper.get('[data-slot="day-mark-outline"]')
    const stroke = () => wrapper.find('[data-slot="day-mark-stroke"]')
    expect(box().attributes('aria-hidden')).toBe('true')
    expect(box().attributes('data-mark')).toBeUndefined()
    expect(box().classes()).toEqual(expect.arrayContaining(['size-10', 'overflow-visible']))
    expect(outline().attributes('d')).toBe(BOX_PATH)
    expect(outline().classes()).toEqual(
      expect.arrayContaining(['stroke-control-border', 'group-hover:stroke-ink']),
    )
    expect(stroke().exists()).toBe(false)
    for (const mark of MARKS) {
      await wrapper.setProps({ mark })
      expect(box().attributes('data-mark')).toBe(mark)
      expect(stroke().attributes('d')).toBe(MARK_PATHS[mark])
      expect(stroke().classes()).toContain(MARK_STROKES[mark])
      expect(wrapper.get('button').attributes('aria-pressed')).toBe('true')
      // Marked, the box no longer darkens on hover: the stroke says it all.
      expect(outline().classes()).not.toContain('group-hover:stroke-ink')
    }
  })

  it('gives each mark a different shape and a different pen, so none rests on colour', () => {
    expect(new Set(Object.values(MARK_PATHS)).size).toBe(3)
    expect(MARK_STROKES).toEqual({
      great: 'stroke-pen',
      partial: 'stroke-pen-partial',
      missed: 'stroke-pen-missed',
    })
  })

  it('names a partial or missed day’s kind; a great day is said by aria-pressed alone', async () => {
    const wrapper = mount(DayMark, { props: { ...PROPS, mark: 'great' } })
    const label = () => wrapper.get('button').attributes('aria-label')
    expect(label()).toBe('Squats, Thursday 22 October')
    await wrapper.setProps({ mark: 'partial', today: true })
    expect(label()).toBe('Squats, Thursday 22 October, today, partly done')
    await wrapper.setProps({ mark: 'missed', today: false })
    expect(label()).toBe("Squats, Thursday 22 October, couldn't do it")
  })

  it('centres a 44px button in a 56 × 60px cell, and changes colour in 120ms at most', () => {
    const wrapper = mount(DayMark, { props: PROPS })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['h-15', 'w-14', 'relative']))
    expect(wrapper.get('button').classes()).toContain('size-11')
    expect(wrapper.get('[data-slot="day-mark-outline"]').classes()).toContain(
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
