import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'

/** How long the page must stay still before it counts as come to rest. */
export const REST_MS = 120

/**
 * Where a scroll that has come to rest should go (PlannerScreen card, K38). `top` is the scroll
 * position, `height` the screen's, `starts` each screen's top in page coordinates, in order, and
 * `direction` the way the person was scrolling (1 down, -1 up), or 0 when nobody scrolled (the
 * window was resized or the device rotated). Inside one screen, nowhere: a tall screen scrolls as
 * usual. Across the line between two, on in the direction of travel: down to the next screen's top,
 * up so the earlier screen's end meets the bottom of the window. With no direction, to whichever
 * screen fills more of the window. Returns null when the page may stay where it is.
 */
export function sprintTarget(
  top: number,
  height: number,
  starts: number[],
  direction: 1 | -1 | 0,
): number | null {
  for (const line of starts.slice(1)) {
    // A line strictly inside the window: part of both screens shows.
    if (line > top + 1 && line < top + height - 1) {
      const down = direction === 0 ? line - top < height / 2 : direction > 0
      return down ? line : line - height
    }
  }
  return null
}

/**
 * The planner's screens never rest side by side (K38): while `enabled`, a scroll that comes to rest
 * across the line between two screens sprints on to the next one. A resize or a rotation that
 * leaves the page across a line settles on the screen that fills more of the window (K40). The screens are the elements
 * matching `[data-planner-screen]`. Scrolling inside a screen is left alone, so a screen with more
 * rows than fit scrolls as usual. The sprint is smooth unless motion is reduced.
 */
export function useScreenSprint(enabled: Ref<boolean>) {
  let last = 0
  let direction: 1 | -1 | 0 = 1
  let timer: ReturnType<typeof setTimeout> | undefined

  function settle(): void {
    if (!enabled.value) return
    const screens = [...document.querySelectorAll<HTMLElement>('[data-planner-screen]')]
    const starts = screens.map((el) => el.getBoundingClientRect().top + window.scrollY)
    const target = sprintTarget(window.scrollY, window.innerHeight, starts, direction)
    if (target === null) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' })
  }

  function onScroll(): void {
    const now = window.scrollY
    if (now !== last) direction = now > last ? 1 : -1
    last = now
    clearTimeout(timer)
    timer = setTimeout(settle, REST_MS)
  }

  /** A resize or rotation: no one scrolled, so no direction until the next scroll says one. */
  function onResize(): void {
    direction = 0
    last = window.scrollY
    clearTimeout(timer)
    timer = setTimeout(settle, REST_MS)
  }

  watch(enabled, (on) => {
    if (!on) clearTimeout(timer)
  })
  onMounted(() => {
    last = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
  })
  onBeforeUnmount(() => {
    clearTimeout(timer)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
  })
}
