import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import {
  BOX_PATH,
  DRAWINGS,
  DayMark,
  MARK_DRAWINGS,
  MARK_PENS,
  dayMarkLabel,
  markDrawing,
} from '@/components/ui/day-mark'
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

  it('draws an empty hand-drawn box, and fills a marked one in its pen under the box', async () => {
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
    const drawing = markDrawing(PROPS.name, PROPS.date)
    for (const mark of MARKS) {
      await wrapper.setProps({ mark })
      expect(box().attributes('data-mark')).toBe(mark)
      // The day keeps its drawing whatever its kind; the pen says the kind.
      expect(stroke().attributes('data-drawing')).toBe(drawing)
      expect(stroke().attributes('d')).toBe(MARK_DRAWINGS[drawing].d)
      expect(stroke().classes()).toContain(MARK_PENS[mark])
      expect(wrapper.get('button').attributes('aria-pressed')).toBe('true')
      // Marked, the box no longer darkens on hover: the fill says it all.
      expect(outline().classes()).not.toContain('group-hover:stroke-ink')
    }
    // The box is drawn last, over the fill, as a pen line shows through marker.
    const paths = box().findAll('path')
    expect(paths.map((p) => p.attributes('data-slot'))).toEqual([
      'day-mark-stroke',
      'day-mark-outline',
    ])
  })

  it('fills the solid drawing and strokes the two scribbles, all in currentColor', async () => {
    expect(DRAWINGS.map((d) => MARK_DRAWINGS[d].filled)).toEqual([false, true, false])
    for (const name of ['Push-ups', 'Squats', 'Plank', 'Lunges']) {
      const wrapper = mount(DayMark, { props: { ...PROPS, name, mark: 'great' } })
      const stroke = wrapper.get('[data-slot="day-mark-stroke"]')
      const { filled } = MARK_DRAWINGS[markDrawing(name, PROPS.date)]
      expect(stroke.attributes('stroke')).toBe('currentColor')
      expect(stroke.attributes('fill')).toBe(filled ? 'currentColor' : 'none')
      expect(stroke.attributes('stroke-width')).toBe(filled ? '1.5' : '3.5')
    }
  })

  it('picks a drawing from the row and the date, the same on every render', () => {
    expect(markDrawing('Squats', 'Thursday 22 October')).toBe(
      markDrawing('Squats', 'Thursday 22 October'),
    )
    // A week of a few rows uses all three drawings, so the grid looks filled by hand.
    const days = ['Monday 19', 'Tuesday 20', 'Wednesday 21', 'Thursday 22', 'Friday 23']
    const used = new Set(
      ['Push-ups', 'Squats', 'Plank'].flatMap((name) =>
        days.map((day) => markDrawing(name, `${day} October`)),
      ),
    )
    expect(used).toEqual(new Set(DRAWINGS))
  })

  it('gives each kind its own pen', () => {
    expect(MARK_PENS).toEqual({
      great: 'text-pen',
      partial: 'text-pen-partial',
      missed: 'text-pen-missed',
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
