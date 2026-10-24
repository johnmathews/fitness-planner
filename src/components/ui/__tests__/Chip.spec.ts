import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Chip } from '@/components/ui/chip'

describe('Chip', () => {
  it('is a quiet span in label type on a tile, never wrapping or clickable', () => {
    const chip = mount(Chip, { slots: { default: '3 × 12' } })
    expect(chip.element.tagName).toBe('SPAN')
    expect(chip.text()).toBe('3 × 12')
    expect(chip.classes()).toEqual(
      expect.arrayContaining([
        'label',
        'bg-tile',
        'text-ink-secondary',
        'rounded-sm',
        'px-2',
        'whitespace-nowrap',
      ]),
    )
    expect(chip.attributes('tabindex')).toBeUndefined()
    expect(chip.html()).not.toContain('pen')
  })

  it('swaps the fill for a 1px rule on paper', () => {
    const chip = mount(Chip, { slots: { default: '16 kg' } })
    expect(chip.classes()).toEqual(expect.arrayContaining(['print:border', 'print:border-line']))
  })
})
