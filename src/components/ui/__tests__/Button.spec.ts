import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Button, buttonVariants } from '@/components/ui/button'

function classes(el: { classes(): string[] }): string {
  return el.classes().join(' ')
}

describe('Button', () => {
  it('is a secondary md button of type "button" by default', () => {
    const wrapper = mount(Button, { slots: { default: 'Export' } })
    const button = wrapper.get('button')
    expect(button.text()).toBe('Export')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('data-variant')).toBe('secondary')
    expect(button.attributes('data-size')).toBe('md')
    expect(button.classes()).toEqual(expect.arrayContaining(['h-11', 'px-4', 'rounded-md']))
    expect(button.classes()).toEqual(expect.arrayContaining(['font-semibold', 'text-base']))
  })

  it('fills the primary with ink and on-ink text (K8)', () => {
    const button = mount(Button, { props: { variant: 'primary' } }).get('button')
    expect(button.classes()).toEqual(expect.arrayContaining(['bg-ink', 'text-on-ink']))
    expect(classes(button)).not.toContain('border-control-border')
  })

  it('outlines the secondary with the control border and ink text', () => {
    const button = mount(Button, { props: { variant: 'secondary' } }).get('button')
    expect(button.classes()).toEqual(
      expect.arrayContaining(['border-control-border', 'text-ink', 'hover:not-disabled:bg-tile']),
    )
    expect(classes(button)).not.toContain('bg-ink')
  })

  it('gives the quiet button no border colour and a tile on hover', () => {
    const button = mount(Button, { props: { variant: 'quiet' } }).get('button')
    expect(button.classes()).toEqual(
      expect.arrayContaining(['text-ink', 'hover:not-disabled:bg-tile']),
    )
    expect(classes(button)).not.toContain('border-control-border')
    expect(classes(button)).not.toContain('bg-ink')
  })

  it('is 36px from 640px up when small, and 44px below so phone targets stay 44px', () => {
    const button = mount(Button, { props: { size: 'sm' } }).get('button')
    expect(button.attributes('data-size')).toBe('sm')
    expect(button.classes()).toEqual(
      expect.arrayContaining(['h-11', 'sm:h-9', 'sm:px-3', 'sm:text-sm']),
    )
  })

  it('marks a busy button with aria-busy, keeps its label and its full colour', () => {
    const wrapper = mount(Button, {
      props: { variant: 'primary', busy: true },
      slots: { default: 'Signing in…' },
    })
    const button = wrapper.get('button')
    expect(button.attributes('aria-busy')).toBe('true')
    expect(button.text()).toBe('Signing in…')
    expect(button.attributes('disabled')).toBeUndefined()
    // The busy look changes the cursor only; nothing fades.
    expect(classes(button)).not.toMatch(/(^| )aria-busy:opacity/)
    expect(button.classes()).toEqual(
      expect.arrayContaining(['bg-ink', 'aria-busy:cursor-progress']),
    )
  })

  it('has no aria-busy attribute when not busy', () => {
    const button = mount(Button).get('button')
    expect(button.attributes('aria-busy')).toBeUndefined()
  })

  it('fades to 40% only through the disabled attribute, and a disabled button does not click', async () => {
    const clicks: Event[] = []
    const wrapper = mount(Button, {
      attrs: { disabled: true, onClick: (e: Event) => clicks.push(e) },
      slots: { default: 'Import…' },
    })
    const button = wrapper.get('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.classes()).toContain('disabled:opacity-40')
    expect(classes(button)).not.toMatch(/(^| )opacity-/)
    await button.trigger('click')
    expect(clicks).toHaveLength(0)
  })

  it('clicks when enabled and can submit a form', async () => {
    const clicks: Event[] = []
    const wrapper = mount(Button, {
      props: { type: 'submit' },
      attrs: { onClick: (e: Event) => clicks.push(e) },
    })
    expect(wrapper.get('button').attributes('type')).toBe('submit')
    await wrapper.get('button').trigger('click')
    expect(clicks).toHaveLength(1)
  })

  it('merges a consumer class, letting it win a conflict', () => {
    const button = mount(Button, { props: { class: 'w-full px-6' } }).get('button')
    expect(button.classes()).toEqual(expect.arrayContaining(['w-full', 'px-6']))
    expect(button.classes()).not.toContain('px-4')
  })

  it('uses the solid global focus outline, not a translucent ring', () => {
    for (const variant of ['primary', 'secondary', 'quiet'] as const) {
      for (const size of ['sm', 'md'] as const) {
        const value = buttonVariants({ variant, size })
        expect(value).not.toMatch(/ring|outline-none/)
        expect(value).toContain('motion-safe:transition-[color,background-color,border-color]')
        expect(value).toContain('motion-safe:duration-120')
      }
    }
  })
})
