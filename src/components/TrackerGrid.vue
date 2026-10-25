<script setup lang="ts">
import type { Day } from '@/stores/planner'
import type { Mark } from '@/lib/storage'
import type { CountTone, PickedCount, Tracked } from '@/lib/tracker'
import { useGridNav } from '@/composables/gridNav'
import { computed, onMounted, ref, watch } from 'vue'
import TrackerRow, { stickyName } from '@/components/TrackerRow.vue'

const props = defineProps<{
  /** The rows' kind, for the name column's hidden header: "Exercise" or "Food". */
  label: string
  /** The table's name, repeating the section and week: "Exercises, week of 19 October". */
  tableLabel: string
  items: Tracked[]
  days: Day[]
  marksFor: (id: string) => (Mark | null)[]
  totalFor: (id: string) => number
  detailsFor?: (item: Tracked) => string[]
  /** Adds an edit button to each row in config mode, which emits `edit`. */
  editable?: boolean
  configMode: boolean
  /** The Picked row (exercises only): its caption ("3 a day") and each day's count. */
  picked?: { caption: string; counts: PickedCount[] }
}>()

defineEmits<{
  toggle: [id: string, day: number]
  remove: [id: string]
  edit: [id: string]
}>()

/** The Picked row's counts (WeekGrid card): quiet under the pick, ink at it, caution over it. */
const TONE: Record<Exclude<CountTone, 'future'>, string> = {
  under: 'text-ink-secondary',
  met: 'font-semibold text-ink',
  over: 'font-semibold text-caution-ink underline decoration-[1.5px] underline-offset-[3px]',
}

/**
 * Edit plan's widths: the name column grows by the edit button and its gap, and the table by that
 * and the 56px Remove column, so the days keep their 56px minimum (WeekGrid card). Both grids
 * get the same widths, so their days line up.
 */
const widths = computed(() =>
  props.configMode
    ? { name: 'w-47 sm:w-63', table: 'min-w-177 sm:min-w-197' }
    : { name: 'w-34 sm:w-50', table: 'min-w-150 sm:min-w-170' },
)

// One tab stop for the whole grid, on today's DayMark in the first row (see gridNav for the keys
// and for Edit plan's controls in the row headers).
const table = ref<HTMLTableElement | null>(null)
useGridNav(table, {
  widget: '[data-slot="day-mark-button"]',
  start: '[data-slot="day-mark-button"][aria-current="date"]',
})

/**
 * Opens with today in view (WeekGrid card, phone): the day before today sits beside the names, then
 * today, so no one has to scroll sideways to mark it. Another week opens at Monday, and Edit plan at
 * the start, since there the names (with their controls) don't stick and would otherwise be off
 * screen. Where the table fits (sm and up) there is nothing to scroll, and this changes nothing.
 */
const scroller = ref<HTMLDivElement | null>(null)
function scrollToToday(): void {
  const heads = table.value!.tHead!.rows[0]!.cells
  // Header cells: the names at 0, then Monday at 1, so the day before today is at today's index.
  const today = props.days.findIndex((d) => d.isToday)
  scroller.value!.scrollLeft =
    !props.configMode && today > 0 ? heads[today]!.offsetLeft - heads[0]!.offsetWidth : 0
}
onMounted(scrollToToday)
watch([() => props.days, () => props.configMode], scrollToToday, { flush: 'post' })

/**
 * Brings a focused day or total wholly into view. Chrome's own focus scroll leaves a cell that is
 * already partly visible where it is, even half under the sticky names; scrollIntoView honours the
 * scroller's scroll-padding-left. The names are always in view, so they are left alone.
 */
function reveal(ev: FocusEvent): void {
  const el = ev.target as HTMLElement
  // Optional: jsdom has no scrollIntoView.
  if (el.closest('td')) el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
}
</script>

<!--
  One week as a table (brand/design-system/project/components/WeekGrid): the name column (200px,
  136px below 640px), seven day columns sharing the rest, and the 88px "Week" total (72px).
  Hairline rules between rows, an ink rule under the header, no boxes and no card around it.
  Today's highlight band runs down its column from the header to the Picked row. Below 600px the
  table scrolls sideways inside its own container, never the page: the container is positioned so
  the visually hidden text inside it can't escape and widen the page. The name column is sticky
  (stickyName) and the container's scroll-padding-left is its width, so a focused cell scrolls
  clear of the names rather than under them; the container opens scrolled to today (scrollToToday).

  Edit plan widens the name column by exactly the edit button it gains and adds a 56px Remove
  column after "Week", so each row keeps its height (F25).

  Keyboard (F15): the WAI-ARIA grid, one tab stop per grid (useGridNav). A day cell's focus is its
  DayMark, the cell's one widget; the names, totals and Picked cells take focus themselves and
  draw the focus ring inset, so the scroller never clips it.
-->
<template>
  <div
    ref="scroller"
    class="relative overflow-x-auto print:overflow-visible"
    :class="{ 'scroll-pl-34 sm:scroll-pl-50': !configMode }"
    @focusin="reveal"
  >
    <table
      ref="table"
      role="grid"
      :aria-label="tableLabel"
      class="w-full table-fixed border-collapse tabular-nums"
      :class="
        // Wide enough that a day column never drops below 56px: the other columns plus 7 × 56
        // (600px on a phone and 680px above, as the card's 600px minimum assumes).
        widths.table
      "
    >
      <colgroup>
        <col :class="widths.name" />
        <col v-for="d in days" :key="d.key" />
        <col class="w-18 sm:w-22" />
        <col v-if="configMode" class="w-14" />
      </colgroup>
      <thead>
        <tr role="row" class="border-b border-ink">
          <th scope="col" role="columnheader" class="p-0" :class="stickyName(configMode)">
            <span class="sr-only">{{ label }}</span>
          </th>
          <th
            v-for="d in days"
            :key="d.key"
            scope="col"
            role="columnheader"
            class="px-0 py-2 text-center font-normal"
            :class="{ 'bg-highlight': d.isToday }"
            :aria-current="d.isToday ? 'date' : undefined"
            :data-today="d.isToday"
            data-testid="day-head"
          >
            <span class="label block text-ink">{{ d.name }}</span>
            <span
              class="block text-sm"
              :class="d.isToday ? 'font-semibold text-ink' : 'text-ink-secondary'"
              >{{ d.date }}</span
            >
            <span v-if="d.isToday" class="sr-only">, today</span>
          </th>
          <th
            scope="col"
            role="columnheader"
            class="label px-0 py-2 text-center text-ink-secondary"
          >
            Week
          </th>
          <th v-if="configMode" scope="col" role="columnheader" class="p-0" data-noprint>
            <span class="sr-only">Remove</span>
          </th>
        </tr>
      </thead>

      <tbody>
        <TrackerRow
          v-for="it in items"
          :key="it.id"
          :item="it"
          :details="detailsFor?.(it)"
          :editable="editable"
          :config-mode="configMode"
          :days="days"
          :marks="marksFor(it.id)"
          :total="totalFor(it.id)"
          @toggle="$emit('toggle', it.id, $event)"
          @remove="$emit('remove', it.id)"
          @edit="$emit('edit', it.id)"
        />
      </tbody>

      <!-- On paper a split table repeats its header, but the Picked row prints once, at the end. -->
      <tfoot v-if="picked" class="print:table-row-group">
        <tr role="row">
          <th
            scope="row"
            role="rowheader"
            class="py-3 pr-1.5 pl-1.5 text-left align-top font-normal focus-visible:-outline-offset-2"
            :class="stickyName(configMode)"
          >
            <span class="body block text-ink">Picked</span>
            <span class="caption block text-ink-secondary">{{ picked.caption }}</span>
          </th>
          <td
            v-for="(c, i) in picked.counts"
            :key="i"
            role="gridcell"
            class="px-0.5 py-3 text-center align-top focus-visible:-outline-offset-2"
            :class="{ 'bg-highlight': days[i]!.isToday }"
            :data-tone="c.tone"
            data-testid="day-count"
          >
            <template v-if="c.tone === 'future'">
              <span aria-hidden="true" class="body block text-ink-secondary">–</span>
              <span class="sr-only">Not yet</span>
            </template>
            <template v-else>
              <span data-testid="day-count-figure" class="block text-base" :class="TONE[c.tone]">{{
                c.n
              }}</span>
              <template v-if="c.extra">
                <span class="sr-only">,</span>
                <span data-testid="day-count-extra" class="caption block text-caution-ink">{{
                  c.extra
                }}</span>
              </template>
            </template>
          </td>
          <!-- Nothing to total for the picks (the section's figure counts the week) and nothing to
               remove, so these cells are out of the accessibility tree and the grid's navigation. -->
          <td aria-hidden="true" class="p-0" />
          <td v-if="configMode" aria-hidden="true" class="p-0" data-noprint />
        </tr>
      </tfoot>
    </table>
  </div>
</template>
