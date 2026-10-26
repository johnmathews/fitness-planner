import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { BrandMark, brandMarkVariants } from '@/components/ui/brand-mark'
import { WORDMARK_PATH, WORDMARK_VIEWBOX } from '@/components/ui/brand-mark/wordmark'
import { APP_NAME } from '@/lib/app'

describe('BrandMark', () => {
  it('draws the outlined wordmark in the current colour, named from the one app name', () => {
    const svg = mount(BrandMark).get('svg')
    expect(svg.attributes()).toMatchObject({
      role: 'img',
      'aria-label': APP_NAME,
      viewBox: WORDMARK_VIEWBOX,
    })
    expect(svg.get('path').attributes('d')).toBe(WORDMARK_PATH)
    // 20px tall in the Header, ink only: fill follows `color`, which is the ink role.
    expect(svg.classes()).toEqual(expect.arrayContaining(['h-5', 'fill-current', 'text-ink']))
  })

  it('is 32px tall on the sign-in card', () => {
    expect(
      mount(BrandMark, { props: { size: 'lg' } })
        .get('svg')
        .classes(),
    ).toContain('h-8')
  })

  it('has no monogram (K44): the wordmark is the only form', () => {
    expect(mount(BrandMark).find('span').exists()).toBe(false)
    expect(APP_NAME).toBe('Tracker')
  })

  it('never takes the pen', () => {
    for (const size of ['md', 'lg'] as const) {
      expect(brandMarkVariants({ size })).not.toMatch(/pen/)
    }
  })

  it('merges a consumer class', () => {
    expect(mount(BrandMark, { props: { class: 'mb-6' } }).classes()).toContain('mb-6')
  })
})
