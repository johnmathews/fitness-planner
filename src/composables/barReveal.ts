import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

/** How long the bar stays after the pointer leaves it (Header card, Out of sight). */
export const HIDE_AFTER_MS = 500
/** How far the handle must be pulled down before the bar comes. */
const PULL_PX = 12

/**
 * How the Header comes and goes on the planner's screens (Header card, Out of sight; K25).
 *
 * - **Pointer:** entering the strip along the top edge shows the bar; leaving the bar hides it
 *   after HIDE_AFTER_MS, unless focus is inside it.
 * - **Finger:** pressing the handle toggles the bar, and pulling the handle down shows it.
 * - **Anywhere:** a press outside the bar and the handle hides it, and so does Escape, which also
 *   takes focus out of the bar (the bar shows while focus is inside it, by CSS).
 *
 * While `enabled` is false (Edit plan, Settings) the bar is the ordinary sticky Header and none of
 * this applies.
 */
export function useBarReveal(bar: Ref<HTMLElement | null>, enabled: Ref<boolean>) {
  const shown = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  let pullFrom: number | null = null

  function show(): void {
    clearTimeout(timer)
    shown.value = true
  }
  function hideSoon(after = HIDE_AFTER_MS): void {
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (!bar.value?.matches(':focus-within')) shown.value = false
    }, after)
  }

  /** The strip at the top edge: a pointer that can hover, not a finger. */
  function onStripEnter(ev: PointerEvent): void {
    if (ev.pointerType !== 'touch') show()
  }
  function onBarEnter(ev: PointerEvent): void {
    if (ev.pointerType !== 'touch' && shown.value) show()
  }
  function onBarLeave(ev: PointerEvent): void {
    if (ev.pointerType !== 'touch') hideSoon()
  }

  function onHandleDown(ev: PointerEvent): void {
    pullFrom = ev.clientY
  }
  function onHandleMove(ev: PointerEvent): void {
    if (pullFrom !== null && ev.clientY - pullFrom > PULL_PX) {
      pullFrom = null
      show()
    }
  }
  function onHandleClick(): void {
    pullFrom = null
    if (shown.value) shown.value = false
    else show()
  }

  function onPointerDown(ev: PointerEvent): void {
    if (!enabled.value || !shown.value) return
    const target = ev.target as Element | null
    if (target?.closest('[data-slot="bar"], [data-slot="bar-handle"]')) return
    hideSoon(0)
  }
  function onKeydown(ev: KeyboardEvent): void {
    if (!enabled.value || ev.key !== 'Escape') return
    shown.value = false
    const active = document.activeElement as HTMLElement | null
    if (active && bar.value?.contains(active)) active.blur()
  }

  watch(enabled, (on) => {
    if (!on) shown.value = false
  })
  onMounted(() => {
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeydown)
  })
  onBeforeUnmount(() => {
    clearTimeout(timer)
    document.removeEventListener('pointerdown', onPointerDown)
    document.removeEventListener('keydown', onKeydown)
  })

  return {
    shown,
    onStripEnter,
    onBarEnter,
    onBarLeave,
    onHandleDown,
    onHandleMove,
    onHandleClick,
  }
}
