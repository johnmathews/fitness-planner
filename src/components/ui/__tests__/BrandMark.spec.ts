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
      'data-variant': 'wordmark',
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

  it('sets the monogram live in the serif at 600, as one image named the same', () => {
    const mark = mount(BrandMark, { props: { variant: 'monogram' } }).get('span')
    expect(mark.text()).toBe('FP')
    expect(mark.attributes('role')).toBe('img')
    expect(mark.attributes('aria-label')).toBe(APP_NAME)
    expect(mark.classes()).toEqual(
      expect.arrayContaining(['font-serif', 'font-semibold', 'text-[20px]', 'text-ink']),
    )
    expect(mount(BrandMark, { props: { variant: 'monogram', size: 'lg' } }).classes()).toContain(
      'text-[32px]',
    )
  })

  it('never takes the pen or the highlight', () => {
    for (const variant of ['wordmark', 'monogram'] as const) {
      for (const size of ['md', 'lg'] as const) {
        expect(brandMarkVariants({ variant, size })).not.toMatch(/pen|highlight/)
      }
    }
  })

  it('merges a consumer class', () => {
    expect(mount(BrandMark, { props: { class: 'mb-6' } }).classes()).toContain('mb-6')
  })
})
