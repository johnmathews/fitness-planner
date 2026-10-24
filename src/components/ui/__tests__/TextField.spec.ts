import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { TextField, textFieldVariants } from '@/components/ui/text-field'

type Props = InstanceType<typeof TextField>['$props']

function mountField(props: Props, attrs: Record<string, unknown> = {}): VueWrapper {
  return mount(TextField, { props, attrs })
}

describe('TextField', () => {
  it('shows a visible label tied to the input by the consumer id', () => {
    const wrapper = mountField({ label: 'Username', id: 'login-username' })
    const label = wrapper.get('label')
    expect(label.text()).toBe('Username')
    expect(label.classes()).toEqual(expect.arrayContaining(['label', 'text-ink']))
    expect(label.attributes('for')).toBe('login-username')
    expect(wrapper.get('input').attributes('id')).toBe('login-username')
  })

  it('generates a stable id when none is given', async () => {
    const wrapper = mountField({ label: 'Name', hint: 'As it shows in the grid.' })
    const id = wrapper.get('input').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.get('label').attributes('for')).toBe(id)
    expect(wrapper.get('input').attributes('aria-describedby')).toBe(`${id}-hint`)
    await wrapper.setProps({ hint: 'Changed.' })
    expect(wrapper.get('input').attributes('id')).toBe(id)
  })

  it('forwards inputmode, autocomplete, name, type, required and data-* to the input, not the wrapper', () => {
    const wrapper = mountField(
      { label: 'Weight in kg', id: 'weight' },
      {
        inputmode: 'decimal',
        autocomplete: 'off',
        name: 'weight',
        type: 'text',
        required: '',
        'data-testid': 'weight-input',
        style: 'max-width: 8rem',
      },
    )
    const input = wrapper.get('input')
    expect(input.attributes()).toMatchObject({
      id: 'weight',
      inputmode: 'decimal',
      autocomplete: 'off',
      name: 'weight',
      type: 'text',
      required: '',
      'data-testid': 'weight-input',
      style: 'max-width: 8rem;',
    })
    const root = wrapper.get('[data-slot="text-field"]')
    for (const name of [
      'id',
      'inputmode',
      'autocomplete',
      'name',
      'type',
      'data-testid',
      'style',
    ]) {
      expect(root.attributes(name)).toBeUndefined()
    }
  })

  it('puts a consumer class on the wrapper, for layout', () => {
    const wrapper = mountField({ label: 'Reps', class: 'w-24' })
    expect(wrapper.get('[data-slot="text-field"]').classes()).toContain('w-24')
    expect(wrapper.get('input').classes()).not.toContain('w-24')
  })

  it('is 44px tall on panel, with a control border, radius-sm and tabular figures', () => {
    const input = mountField({ label: 'Sets' }).get('input')
    expect(input.classes()).toEqual(
      expect.arrayContaining([
        'h-11',
        'rounded-sm',
        'border',
        'border-control-border',
        'bg-panel',
        'px-3',
        'text-base',
        'text-ink',
        'tabular-nums',
        'placeholder:text-ink-secondary',
        'aria-invalid:border-error-ink',
      ]),
    )
    expect(textFieldVariants()).not.toMatch(/ring|outline-none/)
    expect(textFieldVariants()).toContain('motion-safe:duration-120')
  })

  it('ties a hint below the field with aria-describedby', () => {
    const wrapper = mountField({ label: 'Password', id: 'pw', hint: 'At least 10 characters.' })
    const hint = wrapper.get('#pw-hint')
    expect(hint.text()).toBe('At least 10 characters.')
    expect(hint.classes()).toEqual(expect.arrayContaining(['caption', 'text-ink-secondary']))
    const input = wrapper.get('input')
    expect(input.attributes('aria-describedby')).toBe('pw-hint')
    expect(input.attributes('aria-invalid')).toBeUndefined()
  })

  it('shows an error with the icon and the words, in place of the hint, and marks the input invalid', () => {
    const wrapper = mountField({
      label: 'Repeat password',
      id: 'confirm',
      hint: 'Type it again.',
      error: "The passwords don't match. Type the same password in both fields.",
    })
    const input = wrapper.get('input')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe('confirm-error')
    const error = wrapper.get('#confirm-error')
    expect(error.attributes('role')).toBe('alert')
    expect(error.classes()).toEqual(expect.arrayContaining(['caption', 'text-error-ink']))
    expect(error.text()).toBe("The passwords don't match. Type the same password in both fields.")
    const icon = error.get('svg')
    expect(icon.classes()).toContain('lucide-circle-alert')
    expect(icon.attributes('width')).toBe('16')
    expect(icon.attributes('stroke-width')).toBe('1.5')
    expect(icon.attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('#confirm-hint').exists()).toBe(false)
  })

  it('has no describedby and no error without a hint or error', () => {
    const wrapper = mountField({ label: 'Name', id: 'name' })
    const input = wrapper.get('input')
    expect(input.attributes('aria-describedby')).toBeUndefined()
    expect(input.attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it("keeps a consumer's own aria-describedby alongside its message", () => {
    const wrapper = mountField(
      { label: 'Password', id: 'pw', error: 'Too short. Use at least 10 characters.' },
      { 'aria-describedby': 'pw-rules' },
    )
    expect(wrapper.get('input').attributes('aria-describedby')).toBe('pw-rules pw-error')
  })

  it('marks the input invalid for a message shown elsewhere, without an error line of its own', () => {
    const wrapper = mountField(
      { label: 'Username', id: 'u', invalid: true },
      { 'aria-describedby': 'login-problem' },
    )
    const input = wrapper.get('input')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe('login-problem')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('fades the whole field only when the input is disabled', () => {
    const wrapper = mountField({ label: 'Username', id: 'u' }, { disabled: true })
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-slot="text-field"]').classes()).toContain('has-disabled:opacity-40')
  })

  it('round-trips v-model', async () => {
    const wrapper: VueWrapper = mount(TextField, {
      props: {
        label: 'Name',
        modelValue: 'Push-ups',
        'onUpdate:modelValue': (value: string | number | undefined) =>
          wrapper.setProps({ modelValue: value }),
      },
    })
    const input = wrapper.get('input')
    expect(input.element.value).toBe('Push-ups')
    await input.setValue('Squats')
    expect(wrapper.emitted('update:modelValue')).toEqual([['Squats']])
    expect(input.element.value).toBe('Squats')
    await wrapper.setProps({ modelValue: 'Lunges' })
    expect(input.element.value).toBe('Lunges')
  })
})
