import { settle } from './setup'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { Settings } from '@lucide/vue'
import { IconButton } from '@/components/ui/icon-button'
import { Popover, popoverVariants } from '@/components/ui/popover'

/** A page with something before and after the popover, so focus has somewhere to leave to. */
const Page = defineComponent({
  props: { initialOpen: { type: Boolean, default: false } },
  setup(props) {
    const open = ref(props.initialOpen)
    return () =>
      h('div', [
        h('button', { id: 'before', type: 'button' }, 'Before'),
        h(
          Popover,
          {
            title: 'Settings',
            open: open.value,
            'onUpdate:open': (value: boolean) => (open.value = value),
          },
          {
            trigger: () =>
              h(IconButton, { label: 'Settings', id: 'trigger' }, { default: () => h(Settings) }),
            default: () => [
              // Like a Reka roving group (SegmentedControl): the container keeps tabindex=0.
              h('div', { role: 'group', tabindex: 0 }, [
                h('button', { id: 'first', type: 'button', tabindex: 0 }, 'Export'),
              ]),
              h('button', { id: 'last', type: 'button' }, 'Sign out'),
            ],
          },
        ),
        h('button', { id: 'after', type: 'button' }, 'Push-ups, Mon 19'),
      ])
  },
})

function byId(id: string): HTMLElement {
  const el = document.getElementById(id)
  if (!el) throw new Error(`#${id} not found`)
  return el
}

function panel(): HTMLElement | null {
  return document.querySelector('[data-slot="popover-content"]')
}

async function openPopover(): Promise<VueWrapper> {
  const wrapper = mount(Page, { attachTo: document.body })
  byId('trigger').focus()
  byId('trigger').click()
  await settle()
  expect(panel()).not.toBeNull()
  return wrapper
}

describe('Popover', () => {
  it('opens from its trigger as a dialog labelled by its title, and moves focus into it', async () => {
    await openPopover()
    const trigger = byId('trigger')
    const content = panel()!
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger.getAttribute('aria-controls')).toBe(content.id)
    expect(content.getAttribute('role')).toBe('dialog')
    const title = content.querySelector('h2')!
    expect(title.textContent).toBe('Settings')
    expect(title.classList).toContain('title-2')
    expect(content.getAttribute('aria-labelledby')).toBe(title.id)
    expect(content.contains(document.activeElement)).toBe(true)
  })

  it('renders in place after its trigger, so Tab moves from the panel to what follows', async () => {
    await openPopover()
    const content = panel()!
    // In document order: trigger, then panel, then the next control on the page.
    expect(byId('trigger').compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(content.compareDocumentPosition(byId('after'))).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('closes when focus leaves the panel for something outside it (F14)', async () => {
    await openPopover()
    byId('last').focus()
    byId('after').focus()
    await settle()
    expect(panel()).toBeNull()
    expect(byId('trigger').getAttribute('aria-expanded')).toBe('false')
    // Focus stays where the person sent it.
    expect(document.activeElement).toBe(byId('after'))
  })

  it('lets Tab leave from the last control instead of looping back to the first (F14)', async () => {
    await openPopover()
    byId('last').focus()
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    byId('last').dispatchEvent(tab)
    await settle()
    // Reka's focus scope loops a popover's focus; the browser's own Tab must happen instead.
    expect(tab.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(byId('last'))
    expect(panel()).not.toBeNull()
  })

  it('still lets Tab move between the controls inside the panel', async () => {
    await openPopover()
    byId('first').focus()
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    byId('first').dispatchEvent(tab)
    await settle()
    expect(tab.defaultPrevented).toBe(false)
    expect(panel()).not.toBeNull()
  })

  it('closes on Shift+Tab from the first control, returning focus to the trigger', async () => {
    await openPopover()
    byId('first').focus()
    const back = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    })
    byId('first').dispatchEvent(back)
    await settle()
    expect(back.defaultPrevented).toBe(true)
    expect(panel()).toBeNull()
    expect(document.activeElement).toBe(byId('trigger'))
    expect(byId('trigger').getAttribute('aria-expanded')).toBe('false')
  })

  it('stays open while focus moves inside the panel', async () => {
    await openPopover()
    byId('first').focus()
    byId('last').focus()
    await settle()
    expect(panel()).not.toBeNull()
  })

  it('stays open when focus goes back to its own trigger, which then closes it', async () => {
    await openPopover()
    byId('trigger').focus()
    await settle()
    expect(panel()).not.toBeNull()
    byId('trigger').click()
    await settle()
    expect(panel()).toBeNull()
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    await openPopover()
    byId('first').focus()
    byId('first').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await settle()
    expect(panel()).toBeNull()
    expect(document.activeElement).toBe(byId('trigger'))
  })

  it('closes on a pointer press outside', async () => {
    await openPopover()
    byId('before').dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' }),
    )
    byId('before').dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await settle()
    expect(panel()).toBeNull()
  })

  it('draws the panel on panel, with a line border, radius-lg and the overlay shadow', async () => {
    await openPopover()
    const classes = [...panel()!.classList]
    expect(classes).toEqual(
      expect.arrayContaining([
        'bg-panel',
        'border',
        'border-line',
        'rounded-lg',
        'shadow-overlay',
        'p-4',
        'w-74',
      ]),
    )
    const value = popoverVariants()
    expect(value).not.toMatch(/ring|outline-none|animate-|zoom|slide/)
    expect(value).toContain('motion-safe:duration-120')
  })
})
