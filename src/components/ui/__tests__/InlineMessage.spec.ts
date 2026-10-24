import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { InlineMessage, inlineMessageVariants } from '@/components/ui/inline-message'

describe('InlineMessage', () => {
  it.each([
    ['error', 'alert', 'text-error-ink', 'lucide-circle-alert'],
    ['caution', 'status', 'text-caution-ink', 'lucide-triangle-alert'],
    ['success', 'status', 'text-ink', 'lucide-check'],
    ['info', 'status', 'text-ink-secondary', 'lucide-info'],
  ] as const)(
    'shows %s with role %s, its ink and its icon beside the words',
    (tone, role, ink, icon) => {
      const p = mount(InlineMessage, {
        props: { tone },
        slots: { default: 'Can’t reach the server. Check the connection and try again.' },
      }).get('p')
      expect(p.attributes('role')).toBe(role)
      expect(p.attributes('data-tone')).toBe(tone)
      expect(p.classes()).toEqual(expect.arrayContaining(['caption', 'flex', 'gap-2', ink]))
      expect(p.text()).toBe('Can’t reach the server. Check the connection and try again.')
      const svg = p.get('svg')
      expect(svg.classes()).toContain(icon)
      expect(svg.attributes('width')).toBe('16')
      expect(svg.attributes('stroke-width')).toBe('1.5')
      expect(svg.attributes('aria-hidden')).toBe('true')
    },
  )

  it('never uses the pen, a box or a fill', () => {
    for (const tone of ['error', 'caution', 'success', 'info'] as const) {
      expect(inlineMessageVariants({ tone })).not.toMatch(/pen|bg-|border|rounded|shadow/)
    }
  })

  it('passes the id through and merges a consumer class', () => {
    const p = mount(InlineMessage, {
      props: { tone: 'error', class: 'mt-1' },
      attrs: { id: 'login-problem', 'data-testid': 'login-problem' },
      slots: { default: 'Wrong username or password. Check both and try again.' },
    }).get('p')
    expect(p.attributes('id')).toBe('login-problem')
    expect(p.attributes('data-testid')).toBe('login-problem')
    expect(p.classes()).toContain('mt-1')
  })
})
