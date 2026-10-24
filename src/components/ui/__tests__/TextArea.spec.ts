import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { TextArea, textAreaVariants } from '@/components/ui/text-area'

type Props = InstanceType<typeof TextArea>['$props']

function mountArea(props: Props, attrs: Record<string, unknown> = {}): VueWrapper {
  return mount(TextArea, { props, attrs })
}

describe('TextArea', () => {
  it('shows a visible label tied to the textarea by the consumer id', () => {
    const wrapper = mountArea({ label: 'Note', id: 'note' })
    expect(wrapper.get('label').text()).toBe('Note')
    expect(wrapper.get('label').attributes('for')).toBe('note')
    expect(wrapper.get('textarea').attributes('id')).toBe('note')
  })

  it('generates an id when none is given', () => {
    const wrapper = mountArea({ label: 'Note' })
    const id = wrapper.get('textarea').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.get('label').attributes('for')).toBe(id)
  })

  it('forwards attributes and data-* to the textarea, and a class to the wrapper', () => {
    const wrapper = mountArea(
      { label: 'Note', id: 'note', class: 'col-span-2' },
      { name: 'note', rows: '6', 'data-testid': 'note-input', required: '' },
    )
    expect(wrapper.get('textarea').attributes()).toMatchObject({
      name: 'note',
      rows: '6',
      'data-testid': 'note-input',
      required: '',
    })
    const root = wrapper.get('[data-slot="text-area"]')
    expect(root.classes()).toContain('col-span-2')
    expect(root.attributes('data-testid')).toBeUndefined()
    expect(root.attributes('name')).toBeUndefined()
  })

  it('is at least 104px tall, resizes vertically only, and wears the field skin', () => {
    const area = mountArea({ label: 'Note' }).get('textarea')
    expect(area.classes()).toEqual(
      expect.arrayContaining([
        'min-h-26',
        'resize-y',
        'rounded-sm',
        'border-control-border',
        'bg-panel',
        'text-ink',
        'aria-invalid:border-error-ink',
      ]),
    )
    expect(textAreaVariants()).not.toMatch(/ring|outline-none/)
  })

  it('ties a hint with aria-describedby', () => {
    const wrapper = mountArea({ label: 'Note', id: 'n', hint: 'Up to 2,000 characters.' })
    expect(wrapper.get('#n-hint').text()).toBe('Up to 2,000 characters.')
    expect(wrapper.get('textarea').attributes('aria-describedby')).toBe('n-hint')
    expect(wrapper.get('textarea').attributes('aria-invalid')).toBeUndefined()
  })

  it('shows an error with the icon and words in place of the hint', () => {
    const wrapper = mountArea({
      label: 'Note',
      id: 'n',
      hint: 'Up to 2,000 characters.',
      error: 'This note is 2,140 characters. Shorten it to 2,000 or fewer to save it.',
    })
    const area = wrapper.get('textarea')
    expect(area.attributes('aria-invalid')).toBe('true')
    expect(area.attributes('aria-describedby')).toBe('n-error')
    const error = wrapper.get('#n-error')
    expect(error.attributes('role')).toBe('alert')
    expect(error.classes()).toContain('text-error-ink')
    expect(error.text()).toBe(
      'This note is 2,140 characters. Shorten it to 2,000 or fewer to save it.',
    )
    expect(error.get('svg').classes()).toContain('lucide-circle-alert')
    expect(wrapper.find('#n-hint').exists()).toBe(false)
  })

  it('counts characters against maxLength in tabular figures, tied with aria-describedby', async () => {
    const wrapper: VueWrapper = mount(TextArea, {
      props: {
        label: 'Note',
        id: 'n',
        hint: 'Optional.',
        maxLength: 2000,
        modelValue: 'Left shoulder felt tight on the last set. Dropped to 10 kg.',
        'onUpdate:modelValue': (value: string | undefined) =>
          wrapper.setProps({ modelValue: value }),
      },
    })
    const count = wrapper.get('#n-count')
    expect(count.text()).toBe('59 of 2,000 characters')
    expect(count.classes()).toContain('tabular-nums')
    expect(wrapper.get('textarea').attributes('aria-describedby')).toBe('n-hint n-count')
    // The limit is the consumer's to enforce with an error; the field does not cut text off.
    expect(wrapper.get('textarea').attributes('maxlength')).toBeUndefined()

    await wrapper.get('textarea').setValue('')
    expect(wrapper.get('#n-count').text()).toBe('0 of 2,000 characters')
  })

  it('shows the count without a hint, and keeps it beside an error', () => {
    const wrapper = mountArea(
      { label: 'Note', id: 'n', maxLength: 10, error: 'Too long. Shorten it.' },
      { 'aria-describedby': 'extra' },
    )
    expect(wrapper.get('#n-count').text()).toBe('0 of 10 characters')
    expect(wrapper.get('textarea').attributes('aria-describedby')).toBe('extra n-error n-count')
  })

  it('has no describedby or count with neither hint, error nor maxLength', () => {
    const wrapper = mountArea({ label: 'Note', id: 'n' })
    expect(wrapper.get('textarea').attributes('aria-describedby')).toBeUndefined()
    expect(wrapper.find('#n-count').exists()).toBe(false)
  })

  it('fades the whole field only when disabled', () => {
    const wrapper = mountArea({ label: 'Note' }, { disabled: true })
    expect(wrapper.get('textarea').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-slot="text-area"]').classes()).toContain('has-disabled:opacity-40')
  })

  it('round-trips v-model', async () => {
    const wrapper: VueWrapper = mount(TextArea, {
      props: {
        label: 'Note',
        modelValue: 'First line',
        'onUpdate:modelValue': (value: string | undefined) =>
          wrapper.setProps({ modelValue: value }),
      },
    })
    const area = wrapper.get('textarea')
    expect(area.element.value).toBe('First line')
    await area.setValue('First line\nSecond line')
    expect(wrapper.emitted('update:modelValue')).toEqual([['First line\nSecond line']])
    await wrapper.setProps({ modelValue: 'Replaced' })
    expect(area.element.value).toBe('Replaced')
  })
})
