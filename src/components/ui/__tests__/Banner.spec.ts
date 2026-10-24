import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { CircleAlert, CloudOff } from '@lucide/vue'
import { Banner, bannerVariants } from '@/components/ui/banner'

describe('Banner', () => {
  it('shows offline as neutral: tile fill, line border, the cloud-off icon, lead then sentence', () => {
    const banner = mount(Banner, {
      props: { icon: CloudOff, lead: 'Offline.' },
      slots: {
        default: 'Showing the data saved on this device.',
        action: () => h('button', { type: 'button' }, 'Retry'),
      },
    })
    const root = banner.get('[data-slot="banner"]')
    expect(root.attributes('data-tone')).toBe('neutral')
    expect(root.classes()).toEqual(expect.arrayContaining(['bg-tile', 'border-line', 'rounded-md']))
    const icon = root.get('svg')
    expect(icon.classes()).toContain('lucide-cloud-off')
    expect(icon.attributes('width')).toBe('20')
    expect(icon.attributes('aria-hidden')).toBe('true')
    expect(root.get('[data-slot="banner-lead"]').classes()).toContain('font-semibold')
    expect(root.get('p').text()).toBe('Offline. Showing the data saved on this device.')
    expect(root.get('button').text()).toBe('Retry')
  })

  it('shows a lost change in the error tone: panel fill, error border, error icon and lead', () => {
    const root = mount(Banner, {
      props: { tone: 'error', icon: CircleAlert, lead: 'Your change wasn’t kept.' },
      slots: { default: 'A plan was changed on another device.' },
    }).get('[data-slot="banner"]')
    expect(root.attributes('data-tone')).toBe('error')
    expect(root.classes()).toEqual(expect.arrayContaining(['bg-panel', 'border-error-ink']))
    expect(root.get('svg').classes()).toContain('lucide-circle-alert')
    expect(bannerVariants({ tone: 'error' })).toMatch(
      /\[&_\[data-slot=banner-icon\]\]:text-error-ink/,
    )
  })

  it('tells the two tones apart by more than colour: fill and border differ too', () => {
    expect(bannerVariants({ tone: 'neutral' })).not.toBe(bannerVariants({ tone: 'error' }))
    expect(bannerVariants({ tone: 'neutral' })).toMatch(/print:hidden/)
  })

  it('needs neither an icon, a lead nor an action (loading)', () => {
    const root = mount(Banner, { slots: { default: 'Loading your data…' } })
    expect(root.find('svg').exists()).toBe(false)
    expect(root.find('[data-slot="banner-lead"]').exists()).toBe(false)
    expect(root.find('button').exists()).toBe(false)
    expect(root.get('p').text()).toBe('Loading your data…')
  })
})
