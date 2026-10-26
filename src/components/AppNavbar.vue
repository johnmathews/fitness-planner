<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { ChevronLeft, ChevronRight, Maximize, Minimize, Settings } from '@lucide/vue'
import { usePlannerStore } from '@/stores/planner'
import { weekRange } from '@/lib/dates'
import { BrandMark } from '@/components/ui/brand-mark'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Switch } from '@/components/ui/switch'
import { useBarReveal } from '@/composables/barReveal'
import { useFullscreen } from '@/composables/fullscreen'

const props = defineProps<{
  /** On the Settings page the bar holds only the wordmark: the page links back to the week. */
  page?: 'planner' | 'settings'
  /**
   * On the planner's screens the bar is out of sight until it is wanted (Header card, K25): it
   * lies over the top of the screen, reached by the top edge, the handle or focus.
   */
  overlay?: boolean
}>()

const header = ref<HTMLElement | null>(null)
const reveal = useBarReveal(
  header,
  toRef(() => props.overlay),
)
const fullscreen = useFullscreen()

const store = usePlannerStore()
const otherWeek = computed(() => store.weekKey !== store.currentWeekKey)

function print(): void {
  window.print()
}

/** Settings is a page of its own (#/settings); App shows it on the hash change. */
function openSettings(): void {
  location.hash = '#/settings'
}

/**
 * Today's cell in the first grid that shows today (Exercises, or Food when there are no
 * exercises); in another week, the first day; with no rows anywhere, the first grid's tab stop.
 */
function skipToToday(): void {
  const grids = [...document.querySelectorAll<HTMLElement>('[role="grid"]')]
  const first = (selector: string) =>
    grids.map((g) => g.querySelector<HTMLElement>(selector)).find((el) => el !== null)
  ;(
    first('button[aria-current="date"]') ??
    first('[data-slot="day-mark-button"]') ??
    first('[tabindex="0"]')
  )?.focus()
}
</script>

<!--
  The Header card (brand/design-system/project/components/Header): the wordmark, the week
  navigation at the centre, then "This week" while another week is on screen, the Edit plan
  switch, Settings (which opens the Settings page) and Print. On the Settings page the bar holds
  only the wordmark. Every target is 44px on a phone. Below 640px the planner's bar drops the
  wordmark and keeps the centred arrows and week and Settings on one row, and "This week" and the
  switch take a second row at the right (the Settings page keeps the wordmark); the markup stays in the desktop order, which is
  the tab order.

  "Skip to today" comes first in the tab order (F15): hidden until it has focus, then shown over
  the wordmark with the focus ring; it puts focus on today's cell, past the Header.

  With `overlay` (the planner's screens) the bar is fixed above the top edge and slides down over
  the screen when wanted (Header card, Out of sight): a 14px strip along the top for a pointer
  that can hover, a handle at the top centre wherever a finger may be, and focus anywhere inside
  it (so it stays reachable by Tab). It is moved out of view, never hidden, so its controls stay
  in the Tab order.
-->
<template>
  <template v-if="overlay">
    <div
      aria-hidden="true"
      class="fixed inset-x-0 top-0 z-20 hidden h-3.5 [@media(any-hover:hover)]:block"
      data-noprint
      @pointerenter="reveal.onStripEnter"
    />
    <!-- The handle (Header card): a 40 × 5px pill in an 88 × 44px target. A raw button, since
         no primitive draws a handle; it is named, and pressing it toggles the bar. It is for a
         finger, so it stays out of the Tab order: the keyboard brings the bar by focus. -->
    <button
      type="button"
      aria-label="Show controls"
      :aria-expanded="reveal.shown.value"
      tabindex="-1"
      data-slot="bar-handle"
      class="fixed top-0 left-1/2 z-10 hidden h-11 w-22 -translate-x-1/2 touch-none [@media(any-pointer:coarse)]:block"
      data-noprint
      @pointerdown="reveal.onHandleDown"
      @pointermove="reveal.onHandleMove"
      @click="reveal.onHandleClick"
    >
      <span class="mx-auto mt-2 block h-1.25 w-10 rounded-full bg-control-border" />
    </button>
  </template>
  <header
    ref="header"
    data-slot="bar"
    class="top-0 z-20 border-b border-line bg-canvas"
    :class="
      overlay
        ? [
            'fixed inset-x-0 focus-within:translate-y-0 focus-within:shadow-overlay motion-safe:transition-transform motion-safe:duration-160 motion-safe:ease-out',
            reveal.shown.value ? 'translate-y-0 shadow-overlay' : '-translate-y-[110%]',
          ]
        : 'sticky'
    "
    :data-shown="overlay ? reveal.shown.value : undefined"
    data-noprint
    @pointerenter="reveal.onBarEnter"
    @pointerleave="reveal.onBarLeave"
  >
    <div class="absolute top-1.5 left-2 z-30">
      <!-- not-sr-only zeroes the link's padding, so the span carries it. -->
      <a
        href="#exercises-heading"
        class="sr-only rounded-md bg-panel text-base font-semibold text-ink underline underline-offset-4 shadow-overlay focus:not-sr-only focus:block"
        data-testid="skip-to-today"
        @click.prevent="skipToToday"
        ><span class="block px-3 py-2">Skip to today</span></a
      >
    </div>
    <!-- Three columns, the outer two equal, so the week sits at the bar's centre (Header card).
         On a phone the right-hand group dissolves into the grid (max-sm:contents): Settings stays
         on the first row and the Switch and "This week" take a second, right-aligned. -->
    <div
      class="mx-auto grid min-h-14 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-x-2 py-1 pr-2 pl-4 sm:gap-x-4 sm:px-6 lg:px-8"
    >
      <!-- On a phone's planner the wordmark is left out (Header card): the week and Settings are
           what the bar is for. Hidden rather than removed, so the week stays in the middle. -->
      <div class="justify-self-start" :class="{ 'max-sm:invisible': page !== 'settings' }">
        <!-- Out of the layout too on a phone's planner, so it can't widen the bar; the empty
             column still keeps the week in the middle. -->
        <BrandMark :class="{ 'max-sm:hidden': page !== 'settings' }" />
      </div>
      <nav v-if="page !== 'settings'" class="flex items-center" aria-label="Week">
        <IconButton label="Previous week" @click="store.prevWeek"><ChevronLeft /></IconButton>
        <span
          class="min-w-29 px-2 text-center text-base leading-6 font-semibold whitespace-nowrap tabular-nums"
          aria-live="polite"
          data-testid="week-label"
        >
          {{ weekRange(store.monday) }}
        </span>
        <IconButton label="Next week" @click="store.nextWeek"><ChevronRight /></IconButton>
      </nav>
      <div
        v-if="page !== 'settings'"
        class="flex items-center gap-4 justify-self-end max-sm:contents"
      >
        <div
          class="flex items-center gap-2 max-sm:col-span-3 max-sm:row-start-2 max-sm:justify-self-end sm:gap-4"
        >
          <Button v-if="otherWeek" variant="quiet" size="sm" @click="store.thisWeek">
            This week
          </Button>
          <Switch
            :model-value="store.configMode"
            label="Edit plan"
            short-label="Edit"
            @update:model-value="store.setConfigMode"
          />
          <!-- Full screen (K34): left out where the browser has none, as on an iPhone. -->
          <IconButton
            v-if="fullscreen.supported"
            :label="fullscreen.active.value ? 'Exit full screen' : 'Full screen'"
            data-testid="fullscreen-button"
            @click="fullscreen.toggle"
            ><Minimize v-if="fullscreen.active.value" /><Maximize v-else
          /></IconButton>
        </div>
        <IconButton
          label="Settings"
          class="max-sm:col-start-3 max-sm:row-start-1 max-sm:justify-self-end"
          data-testid="settings-button"
          @click="openSettings"
          ><Settings
        /></IconButton>
        <!-- Printing from a phone is rare, and the bar has no room for it there. -->
        <Button variant="quiet" size="sm" class="max-sm:hidden" @click="print">Print…</Button>
      </div>
    </div>
  </header>
</template>
