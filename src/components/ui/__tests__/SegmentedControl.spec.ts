import { settle } from './setup'
import { describe, expect, it, vi } from 'vitest'
import type { Component } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import {
  SegmentedControl,
  segmentedControlVariants,
  segmentVariants,
} from '@/components/ui/segmented-control'

type Props = InstanceType<typeof SegmentedControl>['$props']

const theme = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

function mountControl(props: Partial<Props> & { modelValue: string }): VueWrapper {
  // Mounted as a plain Component: mount()'s props type cannot take the label-or-ariaLabel union.
  const wrapper: VueWrapper = mount(SegmentedControl as Component, {
    attachTo: document.body,
    props: {
      options: theme,
      ...props,
      'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
    } as Record<string, unknown>,
  })
  return wrapper
}

function pressed(wrapper: VueWrapper): (string | undefined)[] {
  return wrapper.findAll('button').map((b) => b.attributes('aria-pressed'))
}

describe('SegmentedControl', () => {
  it('is a role="group" labelled by its visible label, of aria-pressed buttons', () => {
    const wrapper = mountControl({ label: 'Theme', modelValue: 'system' })
    const label = wrapper.get('[data-slot="segmented-control-label"]')
    expect(label.text()).toBe('Theme')
    expect(label.classes()).toContain('label')
    const group = wrapper.get('[role="group"]')
    expect(group.attributes('aria-labelledby')).toBe(label.attributes('id'))
    expect(group.attributes('aria-label')).toBeUndefined()
    const buttons = wrapper.findAll('button')
    expect(buttons.map((b) => b.text())).toEqual(['System', 'Light', 'Dark'])
    expect(buttons.map((b) => b.attributes('type'))).toEqual(['button', 'button', 'button'])
    expect(pressed(wrapper)).toEqual(['true', 'false', 'false'])
  })

  it('takes an aria-label instead when the segments name the choice themselves', () => {
    const wrapper = mountControl({
      ariaLabel: 'View',
      options: [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'Week' },
      ],
      modelValue: 'week',
    })
    const group = wrapper.get('[role="group"]')
    expect(group.attributes('aria-label')).toBe('View')
    expect(group.attributes('aria-labelledby')).toBeUndefined()
    expect(wrapper.find('[data-slot="segmented-control-label"]').exists()).toBe(false)
    expect(pressed(wrapper)).toEqual(['false', 'true'])
  })

  it('requires a label or an aria-label at the type level', () => {
    // @ts-expect-error a label or an ariaLabel is required
    const props: Props = { options: theme, modelValue: 'system' }
    expect(props.options).toHaveLength(3)
  })

  it('renders nothing, and warns, with neither a label nor an aria-label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mountControl({ label: '', modelValue: 'system' })
    expect(wrapper.find('[role="group"]').exists()).toBe(false)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('SegmentedControl'))
    warn.mockRestore()
  })

  it('chooses the pressed segment', async () => {
    const wrapper = mountControl({ label: 'Theme', modelValue: 'system' })
    await wrapper.findAll('button')[2]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['dark']])
    expect(pressed(wrapper)).toEqual(['false', 'false', 'true'])
  })

  it('keeps the chosen segment chosen when it is pressed again', async () => {
    const wrapper = mountControl({ label: 'Theme', modelValue: 'light' })
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(pressed(wrapper)).toEqual(['false', 'true', 'false'])
  })

  it('moves focus between segments with the arrow keys, from one tab stop', async () => {
    const wrapper = mountControl({ label: 'Theme', modelValue: 'light' })
    await settle()
    const group = wrapper.get('[role="group"]')
    const buttons = wrapper.findAll('button')
    // Reka's roving focus: the group is the one tab stop and hands focus to the chosen segment.
    expect(group.attributes('tabindex')).toBe('0')
    expect(buttons.map((b) => b.attributes('tabindex'))).toEqual(['-1', '-1', '-1'])
    ;(group.element as HTMLElement).focus()
    await settle()
    expect(document.activeElement).toBe(buttons[1]!.element)
    expect(buttons.map((b) => b.attributes('tabindex'))).toEqual(['-1', '0', '-1'])
    await buttons[1]!.trigger('keydown', { key: 'ArrowRight' })
    await settle()
    expect(document.activeElement).toBe(buttons[2]!.element)
    await buttons[2]!.trigger('keydown', { key: 'ArrowLeft' })
    await settle()
    expect(document.activeElement).toBe(buttons[1]!.element)
  })

  it('draws a 44px outline of 42px segments in label type, the chosen one in ink', () => {
    const wrapper = mountControl({ label: 'Theme', modelValue: 'system' })
    expect(wrapper.get('[role="group"]').classes()).toEqual(
      expect.arrayContaining(['border', 'border-control-border', 'rounded-md']),
    )
    for (const button of wrapper.findAll('button')) {
      expect(button.classes()).toEqual(
        expect.arrayContaining([
          'h-[42px]',
          'px-4',
          'rounded-sm',
          'label',
          'text-ink',
          'aria-pressed:bg-ink',
          'aria-pressed:text-on-ink',
          'hover:not-aria-pressed:not-disabled:bg-tile',
          'focus-visible:z-10',
        ]),
      )
    }
    const all = segmentedControlVariants() + ' ' + segmentVariants()
    expect(all).toContain('motion-safe:duration-120')
    expect(all).not.toMatch(/pen|ring|outline-none|overflow-hidden|font-medium|text-xs/)
  })

  it('fades the whole control to 40% only when disabled, and ignores presses then', async () => {
    const wrapper = mountControl({ label: 'Theme', modelValue: 'system', disabled: true })
    const group = wrapper.get('[role="group"]')
    expect(group.attributes('aria-disabled')).toBe('true')
    expect(group.classes()).toContain('aria-disabled:opacity-40')
    for (const button of wrapper.findAll('button')) {
      expect(button.attributes('disabled')).toBeDefined()
    }
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('puts a consumer class on the wrapper', () => {
    const wrapper = mountControl({ label: 'Theme', modelValue: 'system', class: 'mt-2' })
    expect(wrapper.get('[data-slot="segmented-control"]').classes()).toContain('mt-2')
  })
})
