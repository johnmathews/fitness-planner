import { settle } from './setup'
import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { INKS, type InkId } from '@/lib/inks'
import { InkPicker, INK_DOT, inkOptionVariants } from '@/components/ui/ink-picker'

/** Mounts an InkPicker whose v-model is wired back into its props, as a parent's ref would be. */
function mountPicker(modelValue: InkId): { wrapper: VueWrapper; picks: InkId[] } {
  const picks: InkId[] = []
  const wrapper: VueWrapper = mount(InkPicker, {
    attachTo: document.body,
    props: {
      modelValue,
      'onUpdate:modelValue': (id: InkId) => {
        picks.push(id)
        void wrapper.setProps({ modelValue: id })
      },
    },
  })
  return { wrapper, picks }
}

function radio(wrapper: VueWrapper, name: string) {
  return wrapper.findAll('[role="radio"]').find((r) => r.text() === name)!
}

describe('InkPicker', () => {
  it('is a radiogroup labelled "Ink" and described by its hint, of the four inks in order', () => {
    const { wrapper } = mountPicker('ink-blue')
    const group = wrapper.get('[role="radiogroup"]')
    const label = document.getElementById(group.attributes('aria-labelledby')!)!
    const hint = document.getElementById(group.attributes('aria-describedby')!)!
    expect(label.textContent).toBe('Ink')
    expect(label.classList).toContain('label')
    expect(hint.textContent).toBe('The colour of a done mark.')
    expect(hint.classList).toContain('caption')
    expect(wrapper.findAll('[role="radio"]').map((r) => r.text())).toEqual(INKS.map((i) => i.name))
    expect(INKS.map((i) => i.name)).toEqual(['Ink blue', 'Forest', 'Violet', 'Graphite'])
  })

  it('marks the chosen ink by aria-checked, a ring, a check and a bold name, never colour alone', () => {
    const { wrapper } = mountPicker('forest')
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios.map((r) => r.attributes('aria-checked'))).toEqual([
      'false',
      'true',
      'false',
      'false',
    ])
    const forest = radio(wrapper, 'Forest')
    expect(forest.attributes('data-state')).toBe('checked')
    const [dot, name] = forest.findAll('span')
    expect(dot!.classes()).toEqual(
      expect.arrayContaining([
        'size-6',
        'rounded-full',
        'bg-(--forest)',
        'group-data-[state=checked]/ink:outline-2',
        'group-data-[state=checked]/ink:outline-ink',
      ]),
    )
    expect(dot!.attributes('aria-hidden')).toBe('true')
    expect(name!.classes()).toContain('group-data-[state=checked]/ink:font-semibold')
    const check = forest.get('svg')
    expect(check.classes()).toEqual(
      expect.arrayContaining([
        'lucide-check',
        'invisible',
        'group-data-[state=checked]/ink:visible',
      ]),
    )
  })

  it('draws each ink from its own token, so the dot follows the theme', () => {
    for (const ink of INKS) expect(INK_DOT[ink.id]).toBe(`bg-(--${ink.id})`)
    expect(inkOptionVariants()).toMatch(/\bh-11\b/)
    expect(inkOptionVariants()).toMatch(/hover:bg-tile/)
  })

  it('chooses an ink when pressed, and reports a press on the chosen one too', async () => {
    const { wrapper, picks } = mountPicker('ink-blue')
    await radio(wrapper, 'Violet').trigger('click')
    expect(picks).toEqual(['violet'])
    expect(radio(wrapper, 'Violet').attributes('aria-checked')).toBe('true')
    await radio(wrapper, 'Violet').trigger('click')
    expect(picks).toEqual(['violet', 'violet'])
  })

  it('has one tab stop, the chosen ink, and arrow keys move and choose', async () => {
    const { wrapper, picks } = mountPicker('forest')
    await settle()
    const group = wrapper.get('[role="radiogroup"]')
    const radios = wrapper.findAll('[role="radio"]')
    // Reka's roving focus: the group is the one tab stop and hands focus to the chosen ink.
    expect(group.attributes('tabindex')).toBe('0')
    expect(radios.map((r) => r.attributes('tabindex'))).toEqual(['-1', '-1', '-1', '-1'])
    ;(group.element as HTMLElement).focus()
    await settle()
    expect(document.activeElement).toBe(radios[1]!.element)
    await radios[1]!.trigger('keydown', { key: 'ArrowDown' })
    await settle()
    expect(document.activeElement).toBe(radios[2]!.element)
    expect(picks).toEqual(['violet'])
  })

  it('puts a consumer class on the wrapper', () => {
    const wrapper = mount(InkPicker, { props: { modelValue: 'graphite', class: 'mt-2' } })
    expect(wrapper.get('[data-slot="ink-picker"]').classes()).toContain('mt-2')
  })
})
