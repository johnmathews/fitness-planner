import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { TextLink } from '@/components/ui/text-link'

describe('TextLink', () => {
  it('renders an underlined ink anchor with its href and words', () => {
    const wrapper = mount(TextLink, { props: { href: '/' }, slots: { default: 'Go to sign in' } })
    const a = wrapper.get('a')
    expect(a.attributes('href')).toBe('/')
    expect(a.text()).toBe('Go to sign in')
    expect(a.classes()).toEqual(
      expect.arrayContaining([
        'text-ink',
        'underline',
        'decoration-1',
        'underline-offset-3',
        'hover:decoration-2',
      ]),
    )
    expect(a.classes().join(' ')).not.toMatch(/ring|outline-none|text-pen|text-focus/)
  })

  it('passes other attributes through and merges a consumer class', () => {
    const a = mount(TextLink, {
      props: { href: '/privacy', class: 'caption' },
      attrs: { id: 'privacy-link', 'data-testid': 'privacy' },
      slots: { default: 'Privacy' },
    }).get('a')
    expect(a.attributes('id')).toBe('privacy-link')
    expect(a.attributes('data-testid')).toBe('privacy')
    expect(a.classes()).toContain('caption')
  })
})
