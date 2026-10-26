import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { Pencil, Settings } from '@lucide/vue'
import { BarAction } from '@/components/ui/bar-action'

describe('BarAction', () => {
  it('shows its name under the icon, and the name is the accessible name', () => {
    const button = mount(BarAction, {
      props: { label: 'Settings' },
      slots: { default: () => h(Settings) },
    }).get('button')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBeUndefined()
    expect(button.text()).toBe('Settings')
    // The icon comes first, so it sits over the name in the column.
    expect(button.element.firstElementChild?.tagName.toLowerCase()).toBe('svg')
    expect(button.get('svg').attributes('aria-hidden')).toBe('true')
    expect(button.get('svg').attributes('stroke-width')).toBe('1.5')
  })

  it('is no toggle unless told: an ordinary action has no aria-pressed', () => {
    const button = mount(BarAction, { props: { label: 'Print…' } }).get('button')
    expect(button.attributes('aria-pressed')).toBeUndefined()
  })

  it('says whether a toggle is on, and takes the ink fill then (K48)', async () => {
    const wrapper = mount(BarAction, {
      props: { label: 'Edit plan', pressed: false },
      slots: { default: () => h(Pencil) },
    })
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('false')
    await wrapper.setProps({ pressed: true })
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('button').classes()).toEqual(
      expect.arrayContaining(['aria-pressed:bg-ink', 'aria-pressed:text-on-ink']),
    )
  })

  it('sizes itself from the Header, at least a 44px target, never the pen', () => {
    const button = mount(BarAction, { props: { label: 'Full screen' } }).get('button')
    expect(button.classes()).toEqual(
      expect.arrayContaining(['min-h-11', 'min-w-(--bar-tile-min)', 'hover:bg-tile', 'text-ink']),
    )
    expect(button.html()).not.toMatch(/pen/)
  })
})
