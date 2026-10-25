import { settle } from './setup'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { RadioCard, radioCardVariants } from '@/components/ui/radio-card'

const marks = [
  { value: 'squiggles', label: 'Squiggles' },
  { value: 'ticks', label: 'Ticks' },
  { value: 'faces', label: 'Faces' },
]

function mountCard(modelValue: string, picture = true): VueWrapper {
  const wrapper: VueWrapper = mount(RadioCard, {
    attachTo: document.body,
    props: {
      label: 'Marks',
      options: marks,
      modelValue,
      'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
    },
    slots: picture
      ? { picture: ({ option }: { option: { value: string } }) => h('i', option.value) }
      : {},
  })
  return wrapper
}

function checked(wrapper: VueWrapper): (string | undefined)[] {
  return wrapper.findAll('[role="radio"]').map((r) => r.attributes('aria-checked'))
}

describe('RadioCard', () => {
  it('is a radiogroup labelled by its visible label, a radio button per option', () => {
    const wrapper = mountCard('ticks')
    const label = wrapper.get('[data-slot="radio-card-label"]')
    expect(label.text()).toBe('Marks')
    expect(label.classes()).toContain('label')
    const group = wrapper.get('[role="radiogroup"]')
    expect(group.attributes('aria-labelledby')).toBe(label.attributes('id'))
    const rows = wrapper.findAll('[role="radio"]')
    expect(rows.map((r) => r.element.tagName)).toEqual(['BUTTON', 'BUTTON', 'BUTTON'])
    expect(rows.map((r) => r.get('[data-slot="radio-card-name"]').text())).toEqual([
      'Squiggles',
      'Ticks',
      'Faces',
    ])
    expect(checked(wrapper)).toEqual(['false', 'true', 'false'])
  })

  it('draws each option’s picture beside its name, hidden from the accessible name', () => {
    const wrapper = mountCard('ticks')
    const pictures = wrapper.findAll('[data-slot="radio-card-picture"]')
    expect(pictures.map((p) => p.text())).toEqual(['squiggles', 'ticks', 'faces'])
    expect(pictures.every((p) => p.attributes('aria-hidden') === 'true')).toBe(true)
    expect(wrapper.get('[data-slot="radio-card-dot"]').attributes('aria-hidden')).toBe('true')
  })

  it('leaves the picture out when none is given', () => {
    expect(mountCard('ticks', false).find('[data-slot="radio-card-picture"]').exists()).toBe(false)
  })

  it('chooses the pressed row, and keeps the chosen row chosen', async () => {
    const wrapper = mountCard('squiggles')
    await wrapper.findAll('[role="radio"]')[2]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['faces']])
    expect(checked(wrapper)).toEqual(['false', 'false', 'true'])
    await wrapper.findAll('[role="radio"]')[2]!.trigger('click')
    expect(checked(wrapper)).toEqual(['false', 'false', 'true'])
  })

  it('moves to the next row with the arrow keys and chooses it', async () => {
    const wrapper = mountCard('squiggles')
    await settle()
    const rows = wrapper.findAll('[role="radio"]')
    ;(rows[0]!.element as HTMLElement).focus()
    await rows[0]!.trigger('keydown', { key: 'ArrowDown' })
    await settle()
    expect(document.activeElement).toBe(rows[1]!.element)
    expect(checked(wrapper)).toEqual(['false', 'true', 'false'])
  })

  it('outlines a row in control-border, the chosen one 2px ink, and wraps on a phone', () => {
    const classes = radioCardVariants().split(' ')
    expect(classes).toEqual(
      expect.arrayContaining([
        'min-h-19',
        'border',
        'border-control-border',
        'rounded-md',
        'aria-checked:border-2',
        'aria-checked:border-ink',
        'hover:not-aria-checked:bg-tile',
        'max-sm:flex-wrap',
      ]),
    )
  })
})
