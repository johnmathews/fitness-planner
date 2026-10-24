import { settle } from '@/components/ui/__tests__/setup'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { ConfirmHost } from '@/components/ui/confirm-dialog'
import { useConfirm, useConfirmRequest, type ConfirmOptions } from '@/composables/useConfirm'

const replacePlan: ConfirmOptions = {
  title: 'Replace next week’s plan?',
  message: 'The week of 26 October already has its own plan.',
  confirmLabel: 'Replace',
}

function alertDialog(): HTMLElement | null {
  return document.querySelector('[role="alertdialog"]')
}

function button(name: string): HTMLButtonElement {
  const found = [...alertDialog()!.querySelectorAll('button')].find((b) => b.textContent === name)
  if (!found) throw new Error(`no "${name}" button`)
  return found
}

/** Mounts the host and an "asking" control, focuses that control, and asks. */
async function ask(
  options = replacePlan,
): Promise<{ answer: Promise<boolean>; asker: HTMLElement }> {
  mount(ConfirmHost, { attachTo: document.body })
  const asker = document.createElement('button')
  asker.textContent = 'Copy plan to next week'
  document.body.append(asker)
  asker.focus()
  const answer = useConfirm().confirm(options)
  await settle()
  expect(alertDialog()).not.toBeNull()
  return { answer, asker }
}

describe('useConfirm', () => {
  it('shows the question with Cancel and the verb, and resolves true on the verb', async () => {
    const { answer, asker } = await ask()
    expect(alertDialog()!.textContent).toContain('Replace next week’s plan?')
    expect(alertDialog()!.textContent).toContain(replacePlan.message)
    expect(document.activeElement).toBe(button('Cancel'))
    button('Replace').click()
    await expect(answer).resolves.toBe(true)
    await settle()
    expect(alertDialog()).toBeNull()
    expect(document.activeElement).toBe(asker)
  })

  it('resolves false on Cancel and returns focus to the control that asked', async () => {
    const { answer, asker } = await ask()
    button('Cancel').click()
    await expect(answer).resolves.toBe(false)
    await settle()
    expect(alertDialog()).toBeNull()
    expect(document.activeElement).toBe(asker)
  })

  it('resolves false on Escape', async () => {
    const { answer } = await ask()
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await expect(answer).resolves.toBe(false)
  })

  it('takes a cancel label', async () => {
    const { answer } = await ask({ ...replacePlan, cancelLabel: 'Keep it' })
    button('Keep it').click()
    await expect(answer).resolves.toBe(false)
  })

  it('answers an earlier question false when a new one replaces it', async () => {
    const { answer: first } = await ask()
    const second = useConfirm().confirm({
      title: 'Sign out now?',
      message: 'Two changes on this device haven’t reached the server yet.',
      confirmLabel: 'Sign out',
    })
    await expect(first).resolves.toBe(false)
    await settle()
    expect(alertDialog()!.textContent).toContain('Sign out now?')
    button('Sign out').click()
    await expect(second).resolves.toBe(true)
  })

  it('ignores an answer when no question is open', () => {
    const { request, answer } = useConfirmRequest()
    expect(request.value).toBeNull()
    expect(() => answer(true)).not.toThrow()
    expect(request.value).toBeNull()
  })
})
