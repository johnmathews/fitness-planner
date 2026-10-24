<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { usePlannerStore } from '@/stores/planner'
import { weekRange } from '@/lib/dates'
import { BrandMark } from '@/components/ui/brand-mark'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Switch } from '@/components/ui/switch'
import SettingsPopover from '@/components/SettingsPopover.vue'

const store = usePlannerStore()
const otherWeek = computed(() => store.weekKey !== store.currentWeekKey)

function print(): void {
  window.print()
}

/**
 * On the phone's Today list, its first mark (today's first exercise, or food). Otherwise today's
 * cell in the first grid that shows today (Exercises, or Diet when there are no exercises); in
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
  The Header card (brand/design-system/project/components/Header): the wordmark, then the week
  navigation, "This week" while another week is on screen, the Edit plan switch, Settings and
  Print. Every target is 44px on a phone. Below 640px the bar keeps the monogram (under 480px),
  the arrows, the week and Settings on one row, and "This week" and the switch wrap to a second
  row at the right; the markup stays in the desktop order, which is the tab order.

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
    <div
      class="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center gap-x-2 py-1 pr-2 pl-4 sm:gap-x-4 sm:px-6 lg:px-8"
    >
      <BrandMark class="max-[479px]:hidden" />
      <BrandMark variant="monogram" class="min-[480px]:hidden" />
      <nav class="ml-auto flex items-center" aria-label="Week">
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
        class="flex items-center gap-2 max-sm:order-last max-sm:basis-full max-sm:justify-end sm:gap-4"
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
      <SettingsPopover />
      <!-- Printing from a phone is rare, and the bar has no room for it there. -->
      <Button variant="quiet" size="sm" class="max-sm:hidden" @click="print">Print…</Button>
    </div>
  </header>
</template>
