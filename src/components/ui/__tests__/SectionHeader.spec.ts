import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { SectionHeader } from '@/components/ui/section-header'

function header(hint?: string) {
  return mount(SectionHeader, {
    props: { title: 'Exercises', hint, headingId: 'exercises-heading', week: '19–25 October' },
  })
}

describe('SectionHeader', () => {
  it('titles the section with a serif h2 its section can point at', () => {
    const title = header().get('h2')
    expect(title.attributes('id')).toBe('exercises-heading')
    expect(title.text()).toBe('Exercises')
    expect(title.classes()).toContain('title-1')
  })

  it('puts the hint under the title in caption ink-secondary, off paper (F24)', () => {
    const hint = header('Mark each day you ate it.').get('[data-slot="section-hint"]')
    expect(hint.text()).toBe('Mark each day you ate it.')
    expect(hint.classes()).toEqual(expect.arrayContaining(['caption', 'text-ink-secondary']))
    expect(hint.attributes('data-noprint')).toBeDefined()
  })

  it('leaves the hint out when there is none', () => {
    expect(header().find('[data-slot="section-hint"]').exists()).toBe(false)
  })

  it('sets the week on the title’s baseline, hidden from a screen reader, and keeps the heading with what follows on paper (F20)', () => {
    const wrapper = header()
    expect(wrapper.element.tagName).toBe('HEADER')
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'flex-wrap',
        'items-baseline',
        'justify-between',
        'print:break-after-avoid',
      ]),
    )
    const week = wrapper.get('[data-slot="section-week"]')
    expect(week.text()).toBe('19–25 October')
    expect(week.attributes('aria-hidden')).toBe('true')
  })
})
