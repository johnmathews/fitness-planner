import { onScopeDispose, readonly, shallowRef, type DeepReadonly, type ShallowRef } from 'vue'

/** The words of one question (brand/design-system/project/components/ConfirmDialog). */
export interface ConfirmOptions {
  /** The question, naming the thing: "Remove Push-ups?". */
  title: string
  /** The facts, briefly, then what stays. */
  message: string
  /** The verb from the title: "Remove", "Replace", "Sign out". Never "OK" or "Yes". */
  confirmLabel: string
  /** Defaults to "Cancel". */
  cancelLabel?: string
  /** Where focus goes on closing, when not the control that asked (ConfirmDialog). */
  returnFocus?: () => HTMLElement | null
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (answer: boolean) => void
}

// One question at a time for the whole app, shown by the single <ConfirmHost />.
const current = shallowRef<ConfirmRequest | null>(null)

/** Answers the open question, if any, and closes it. */
function answerCurrent(value: boolean): void {
  const request = current.value
  if (!request) return
  current.value = null
  request.resolve(value)
}

/**
 * Asks a yes-or-no question before something that can't be undone, in place of the browser's
 * own confirm box. The answer is true for the verb, false for Cancel or Escape. Needs
 * <ConfirmHost /> mounted once in the app.
 *
 * A question belongs to the component that asked: if that component goes away while its question
 * is still open (its row removed by another tab, the screen signed out), the answer is false, so
 * the verb can never act on something that is no longer there.
 */
export function useConfirm(): { confirm: (options: ConfirmOptions) => Promise<boolean> } {
  let asked: ConfirmRequest | null = null
  // Silent outside a scope (a plain call, as in the specs): there is nothing to outlive.
  onScopeDispose(() => {
    if (asked && current.value === asked) answerCurrent(false)
  }, true)

  function confirm(options: ConfirmOptions): Promise<boolean> {
    // A newer question replaces one still open; the older one is answered "no".
    current.value?.resolve(false)
    return new Promise<boolean>((resolve) => {
      asked = { ...options, resolve }
      current.value = asked
    })
  }
  return { confirm }
}

/**
 * Answers the open question "no" and closes it, for when what it asked about is gone: App calls
 * it when the signed-in user changes, since the question was about the previous user's data.
 */
export function dismissConfirm(): void {
  answerCurrent(false)
}

/** For <ConfirmHost /> only: the open question, and how to answer it. */
export function useConfirmRequest(): {
  request: Readonly<ShallowRef<DeepReadonly<ConfirmRequest> | null>>
  answer: (value: boolean) => void
} {
  return { request: readonly(current), answer: answerCurrent }
}
