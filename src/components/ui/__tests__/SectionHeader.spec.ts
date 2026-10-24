import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { SectionHeader } from '@/components/ui/section-header'
import { StatFigure } from '@/components/ui/stat-figure'

function header(hint?: string) {
  return mount(SectionHeader, {
    props: { title: 'Exercises', hint, headingId: 'exercises-heading' },
    slots: {
      default: () => h(StatFigure, { figure: 10, total: 12, words: 'this week', met: false }),
    },
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

  it('sets the one figure on the title’s baseline, and keeps the heading with what follows on paper (F20)', () => {
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
    expect(wrapper.get('[data-slot="stat-figure"]').text()).toBe('10 of 12 this week')
  })
})
