import { readonly, shallowRef, type DeepReadonly, type ShallowRef } from 'vue'

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
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (answer: boolean) => void
}

// One question at a time for the whole app, shown by the single <ConfirmHost />.
const current = shallowRef<ConfirmRequest | null>(null)

/**
 * Asks a yes-or-no question before something that can't be undone, in place of
 * `window.confirm`. The answer is true for the verb, false for Cancel or Escape. Needs
 * <ConfirmHost /> mounted once in the app.
 */
export function useConfirm(): { confirm: (options: ConfirmOptions) => Promise<boolean> } {
  function confirm(options: ConfirmOptions): Promise<boolean> {
    // A newer question replaces one still open; the older one is answered "no".
    current.value?.resolve(false)
    return new Promise<boolean>((resolve) => {
      current.value = { ...options, resolve }
    })
  }
  return { confirm }
}

/** For <ConfirmHost /> only: the open question, and how to answer it. */
export function useConfirmRequest(): {
  request: Readonly<ShallowRef<DeepReadonly<ConfirmRequest> | null>>
  answer: (value: boolean) => void
} {
  function answer(value: boolean): void {
    const request = current.value
    if (!request) return
    current.value = null
    request.resolve(value)
  }
  return { request: readonly(current), answer }
}
