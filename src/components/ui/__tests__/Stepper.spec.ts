import { settle } from './setup'
import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { Stepper, stepperButtonVariants, stepperVariants } from '@/components/ui/stepper'

type Props = InstanceType<typeof Stepper>['$props']

const base = {
  label: 'Exercises a day',
  lowerLabel: 'Fewer exercises a day',
  raiseLabel: 'More exercises a day',
  min: 1,
  max: 8,
} as const

/** Mounts a Stepper whose v-model is wired back into its props, as a parent's ref would be. */
function mountStepper(props: Partial<Props> & { modelValue: number }): VueWrapper {
  const wrapper: VueWrapper = mount(Stepper, {
    attachTo: document.body,
    props: {
      ...base,
      ...props,
      'onUpdate:modelValue': (value: number) => wrapper.setProps({ modelValue: value }),
    },
  })
  return wrapper
}

function parts(wrapper: VueWrapper) {
  return {
    group: wrapper.get('[role="group"]'),
    lower: wrapper.get('button[aria-label="Fewer exercises a day"]'),
    raise: wrapper.get('button[aria-label="More exercises a day"]'),
    spin: wrapper.get('[role="spinbutton"]'),
    live: wrapper.get('output[aria-live="polite"]'),
  }
}

describe('Stepper', () => {
  it('is a group labelled by the visible label, around a spinbutton with its value and limits', () => {
    const wrapper = mountStepper({ modelValue: 3 })
    const { group, spin } = parts(wrapper)
    const label = wrapper.get('[data-slot="stepper-label"]')
    expect(label.text()).toBe('Exercises a day')
    expect(label.classes()).toContain('label')
    expect(group.attributes('aria-labelledby')).toBe(label.attributes('id'))
    expect(spin.attributes('aria-labelledby')).toBe(label.attributes('id'))
    expect(spin.attributes()).toMatchObject({
      'aria-valuenow': '3',
      'aria-valuemin': '1',
      'aria-valuemax': '8',
    })
    expect((spin.element as HTMLInputElement).value).toBe('3')
  })

  it('names its buttons from lowerLabel and raiseLabel, never "minus" or "plus"', () => {
    const wrapper = mountStepper({ modelValue: 3 })
    const buttons = wrapper.findAll('button')
    expect(buttons.map((b) => b.attributes('aria-label'))).toEqual([
      'Fewer exercises a day',
      'More exercises a day',
    ])
    for (const button of buttons) {
      expect(button.attributes('type')).toBe('button')
      expect(button.attributes('tabindex')).toBeUndefined()
      expect(button.get('svg').attributes('aria-hidden')).toBe('true')
    }
  })

  it('requires label, lowerLabel and raiseLabel at the type level', () => {
    // vue-tsc fails `npm run type-check` here if any of them ever becomes optional.
    // @ts-expect-error label, lowerLabel and raiseLabel are required
    const props: Props = { min: 1, max: 8 }
    expect(props).toEqual({ min: 1, max: 8 })
  })

  it('steps up and down by one, announcing each new value', async () => {
    const wrapper = mountStepper({ modelValue: 3 })
    const { lower, raise, spin, live } = parts(wrapper)
    expect(live.text()).toBe('')
    await raise.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[4]])
    expect(spin.attributes('aria-valuenow')).toBe('4')
    expect(live.text()).toBe('4')
    await lower.trigger('click')
    await lower.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[4], [3], [2]])
    expect(spin.attributes('aria-valuenow')).toBe('2')
    expect(live.text()).toBe('2')
  })

  it('takes a step other than one', async () => {
    const wrapper = mountStepper({ modelValue: 10, min: 0, max: 20, step: 5 })
    await parts(wrapper).raise.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[15]])
  })

  it('clamps at the maximum: the raise button is aria-disabled, stays focusable and does nothing', async () => {
    const wrapper = mountStepper({ modelValue: 7 })
    const { raise, spin } = parts(wrapper)
    expect(raise.attributes('aria-disabled')).toBeUndefined()
    ;(raise.element as HTMLButtonElement).focus()
    await raise.trigger('click')
    expect(spin.attributes('aria-valuenow')).toBe('8')
    expect(raise.attributes('aria-disabled')).toBe('true')
    expect(raise.attributes('disabled')).toBeUndefined()
    expect(document.activeElement).toBe(raise.element)
    await raise.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[8]])
    expect(spin.attributes('aria-valuenow')).toBe('8')
  })

  it('clamps at the minimum', async () => {
    const wrapper = mountStepper({ modelValue: 1 })
    const { lower, raise } = parts(wrapper)
    expect(lower.attributes('aria-disabled')).toBe('true')
    expect(raise.attributes('aria-disabled')).toBeUndefined()
    await lower.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('clamps a step that would overshoot the limit', async () => {
    const wrapper = mountStepper({ modelValue: 18, min: 0, max: 20, step: 5 })
    await parts(wrapper).raise.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[20]])
  })

  it('steps from the keyboard in the spinbutton and clamps there too', async () => {
    const wrapper = mountStepper({ modelValue: 7 })
    const { spin } = parts(wrapper)
    await spin.trigger('keydown', { key: 'ArrowUp' })
    await settle()
    expect(spin.attributes('aria-valuenow')).toBe('8')
    await spin.trigger('keydown', { key: 'ArrowUp' })
    await settle()
    expect(spin.attributes('aria-valuenow')).toBe('8')
    await spin.trigger('keydown', { key: 'Home' })
    await settle()
    expect(spin.attributes('aria-valuenow')).toBe('1')
  })

  it('ignores an empty or unparseable value typed into the spinbutton', async () => {
    const wrapper = mountStepper({ modelValue: 3 })
    const { spin } = parts(wrapper)
    await spin.setValue('')
    await spin.trigger('blur')
    await settle()
    const emitted = (wrapper.emitted('update:modelValue') ?? []).flat()
    expect(emitted.every((value) => Number.isFinite(value))).toBe(true)
    expect(wrapper.props()).toMatchObject({ modelValue: 3 })
  })

  it('is one 44px outline with 44px buttons, tabular figures and no clipping ancestor', () => {
    const wrapper = mountStepper({ modelValue: 3 })
    const { group, lower, spin } = parts(wrapper)
    expect(group.classes()).toEqual(expect.arrayContaining(['h-11', 'rounded-md']))
    expect(stepperVariants()).toContain('before:border-control-border')
    expect(lower.classes()).toEqual(expect.arrayContaining(['size-11', 'text-ink']))
    expect(spin.classes()).toEqual(
      expect.arrayContaining(['tabular-nums', 'font-semibold', 'text-center']),
    )
    // F4: nothing between the buttons and the page may clip their outline.
    const all = [stepperVariants(), stepperButtonVariants(), wrapper.html()].join(' ')
    expect(all).not.toMatch(/overflow-(hidden|clip|auto|scroll)/)
    expect(all).not.toMatch(/ring|outline-none/)
    expect(stepperButtonVariants()).toContain('motion-safe:duration-120')
  })

  it('fades the icon of a button at its limit to 40%, without a hover fill', () => {
    const value = stepperButtonVariants()
    expect(value).toContain('aria-disabled:[&_svg]:opacity-40')
    expect(value).toContain('hover:not-aria-disabled:not-disabled:bg-tile')
  })

  it('disables the whole group only when disabled, fading it to 40%', async () => {
    const wrapper = mountStepper({ modelValue: 3, disabled: true })
    const { group, lower, raise, spin } = parts(wrapper)
    expect(group.classes()).toContain('data-disabled:opacity-40')
    expect(group.attributes('data-disabled')).toBe('')
    for (const el of [lower, raise, spin]) expect(el.attributes('disabled')).toBeDefined()
    await raise.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('can keep its label for screen readers only, still naming the group and spinbutton', () => {
    const wrapper = mountStepper({ modelValue: 4, label: 'Squats goal', hideLabel: true })
    const label = wrapper.get('[data-slot="stepper-label"]')
    expect(label.text()).toBe('Squats goal')
    expect(label.classes()).toEqual(['sr-only'])
    // Positioned, so the hidden label and live region cannot escape a scrolling parent.
    expect(wrapper.get('[data-slot="stepper"]').classes()).toContain('relative')
    expect(wrapper.get('[role="spinbutton"]').attributes('aria-labelledby')).toBe(
      label.attributes('id'),
    )
  })

  it('uses a consumer id for the spinbutton and puts a consumer class on the wrapper', () => {
    const wrapper = mountStepper({ modelValue: 3, id: 'daily-pick', class: 'mt-4' })
    expect(parts(wrapper).spin.attributes('id')).toBe('daily-pick')
    expect(wrapper.get('[data-slot="stepper"]').classes()).toContain('mt-4')
  })
})
