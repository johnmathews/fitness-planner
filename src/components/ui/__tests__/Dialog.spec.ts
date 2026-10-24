import { settle } from './setup'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { Button } from '@/components/ui/button'
import { Dialog, dialogPanelVariants, scrimVariants } from '@/components/ui/dialog'

/** A page that opens the dialog either from its trigger slot or from a plain button of its own. */
const Page = defineComponent({
  props: {
    withTrigger: { type: Boolean, default: true },
    description: { type: String, default: undefined },
    withField: { type: Boolean, default: true },
  },
  setup(props) {
    const open = ref(false)
    return () =>
      h('div', [
        props.withTrigger
          ? null
          : h(
              'button',
              { id: 'opener', type: 'button', onClick: () => (open.value = true) },
              'Edit',
            ),
        h(
          Dialog,
          {
            title: 'Edit exercise',
            description: props.description,
            open: open.value,
            'onUpdate:open': (value: boolean) => (open.value = value),
          },
          {
            trigger: props.withTrigger
              ? () => h(Button, { id: 'trigger' }, { default: () => 'Edit Push-ups' })
              : undefined,
            default: () =>
              props.withField
                ? h('label', ['Name', h('input', { id: 'name' })])
                : h('p', 'Nothing to change.'),
            actions: () => [
              h(Button, { id: 'cancel', onClick: () => (open.value = false) }, () => 'Cancel'),
              h(Button, { variant: 'primary' }, () => 'Save'),
            ],
          },
        ),
      ])
  },
})

function byId(id: string): HTMLElement {
  const el = document.getElementById(id)
  if (!el) throw new Error(`#${id} not found`)
  return el
}

function dialog(): HTMLElement | null {
  return document.querySelector('[role="dialog"]')
}

async function openFrom(id: string, props: Record<string, unknown> = {}): Promise<void> {
  mount(Page, { attachTo: document.body, props })
  byId(id).focus()
  byId(id).click()
  await settle()
  expect(dialog()).not.toBeNull()
}

function pressEscape(): void {
  document.activeElement!.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  )
}

describe('Dialog', () => {
  it('is a modal dialog labelled by its title, with the close button named "Close"', async () => {
    await openFrom('trigger')
    const el = dialog()!
    expect(el.getAttribute('aria-modal')).toBe('true')
    const title = el.querySelector('h2')!
    expect(title.textContent).toBe('Edit exercise')
    expect(title.classList).toContain('title-2')
    expect(el.getAttribute('aria-labelledby')).toBe(title.id)
    const close = el.querySelector('button[aria-label="Close"]')!
    expect(close.querySelector('svg')).not.toBeNull()
  })

  it('ties a description with aria-describedby, and leaves it off without one', async () => {
    await openFrom('trigger', { description: 'Changes apply from this week on.' })
    const el = dialog()!
    const description = document.getElementById(el.getAttribute('aria-describedby')!)!
    expect(description.textContent).toBe('Changes apply from this week on.')
  })

  it('has no aria-describedby without a description', async () => {
    await openFrom('trigger')
    expect(dialog()!.hasAttribute('aria-describedby')).toBe(false)
  })

  it('moves focus to the first field, not the close button', async () => {
    await openFrom('trigger')
    expect(document.activeElement).toBe(byId('name'))
  })

  it('falls back to the close button when the body has nothing to focus', async () => {
    await openFrom('trigger', { withField: false })
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Close')
  })

  it('closes on Escape and returns focus to its trigger', async () => {
    await openFrom('trigger')
    pressEscape()
    await settle()
    expect(dialog()).toBeNull()
    expect(document.activeElement).toBe(byId('trigger'))
  })

  it('closes from the Close button', async () => {
    await openFrom('trigger')
    ;(dialog()!.querySelector('button[aria-label="Close"]') as HTMLElement).click()
    await settle()
    expect(dialog()).toBeNull()
    expect(document.activeElement).toBe(byId('trigger'))
  })

  it('returns focus to the control that opened it when opened without the trigger slot', async () => {
    await openFrom('opener', { withTrigger: false })
    byId('cancel').click()
    await settle()
    expect(dialog()).toBeNull()
    expect(document.activeElement).toBe(byId('opener'))
  })

  it('draws the panel and scrim from the roles, with actions at the end', async () => {
    await openFrom('trigger')
    const el = dialog()!
    expect([...el.classList]).toEqual(
      expect.arrayContaining([
        'bg-panel',
        'border',
        'border-line',
        'rounded-lg',
        'shadow-overlay',
        'max-w-104',
        'overflow-y-auto',
      ]),
    )
    const scrim = document.querySelector('[data-slot="dialog-scrim"]')!
    expect([...scrim.classList]).toEqual(expect.arrayContaining(['bg-scrim', 'opacity-40']))
    const actions = el.querySelector('[data-slot="dialog-actions"]')!
    expect([...actions.classList]).toEqual(
      expect.arrayContaining(['flex', 'flex-wrap', 'justify-end']),
    )
    expect(actions.textContent).toBe('CancelSave')
    // Opacity on the layer, never a colour mix (the card), and no slide, scale or bounce.
    const all = dialogPanelVariants() + ' ' + scrimVariants()
    expect(all).not.toMatch(/bg-scrim\/|ring|outline-none|animate-|zoom|slide|scale/)
  })
})
