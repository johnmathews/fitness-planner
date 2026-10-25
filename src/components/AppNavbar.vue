<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, Settings } from '@lucide/vue'
import { usePlannerStore } from '@/stores/planner'
import { weekRange } from '@/lib/dates'
import { BrandMark } from '@/components/ui/brand-mark'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Switch } from '@/components/ui/switch'

defineProps<{
  /** On the Settings page the bar holds only the wordmark: the page links back to the week. */
  page?: 'planner' | 'settings'
}>()

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
 * On the phone's Today list, its first mark (today's first exercise, or food). Otherwise today's
 * cell in the first grid that shows today (Exercises, or Food when there are no exercises); in
 * another week, the first day; with no rows anywhere, the first grid's tab stop.
 */
function skipToToday(): void {
  const listed = document.querySelector<HTMLElement>(
    '[data-slot="today-list"] [data-slot="day-mark-button"]',
  )
  if (listed) return listed.focus()
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
  only the wordmark. Every target is 44px on a phone. Below 640px the bar keeps the
  monogram (under 480px), the centred arrows and week, and Settings on one row, and "This week"
  and the switch take a second row at the right; the markup stays in the desktop order, which is
  the tab order.

  "Skip to today" comes first in the tab order (F15): hidden until it has focus, then shown over
  the wordmark with the focus ring; it puts focus on today's cell, past the Header, or on the
  phone's Today list on its first mark.
-->
<template>
  <header class="sticky top-0 z-20 border-b border-line bg-canvas" data-noprint>
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
      <div class="justify-self-start">
        <BrandMark class="max-[479px]:hidden" />
        <BrandMark variant="monogram" class="min-[480px]:hidden" />
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
