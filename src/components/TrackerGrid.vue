<script setup lang="ts">
import type { Day } from '@/stores/planner'
import type { CountTone, PickedCount, Tracked } from '@/lib/tracker'
import TrackerRow from '@/components/TrackerRow.vue'

defineProps<{
  /** The rows' kind, for the name column's hidden header: "Exercise" or "Food". */
  label: string
  /** The table's name, repeating the section and week: "Exercises, week of 19 October". */
  tableLabel: string
  items: Tracked[]
  days: Day[]
  flagsFor: (id: string) => boolean[]
  totalFor: (id: string) => number
  detailsFor?: (item: Tracked) => string[]
  /** Adds an edit button to each row, which emits `edit`. */
  editable?: boolean
  configMode: boolean
  /** The Picked row (exercises only): its caption ("3 a day") and each day's count. */
  picked?: { caption: string; counts: PickedCount[] }
}>()

defineEmits<{
  toggle: [id: string, day: number]
  changeTarget: [id: string, delta: number]
  remove: [id: string]
  edit: [id: string]
}>()

/** The Picked row's counts (WeekGrid card): quiet under the pick, ink at it, caution over it. */
const TONE: Record<Exclude<CountTone, 'future'>, string> = {
  under: 'text-ink-secondary',
  met: 'font-semibold text-ink',
  over: 'font-semibold text-caution-ink underline decoration-[1.5px] underline-offset-[3px]',
}
</script>

<!--
  One week as a table (brand/design-system/project/components/WeekGrid): the name column (200px,
  136px below 640px), seven day columns sharing the rest, and the 88px "Week" total (72px).
  Hairline rules between rows, an ink rule under the header, no boxes and no card around it.
  Today's highlight band runs down its column from the header to the Picked row. Below 600px the
  table scrolls sideways inside its own container, never the page (W12 makes the names sticky):
  the container is positioned so the visually hidden text inside it can't escape and widen the page.

  Edit plan widens only the name column, by exactly the controls it gains (a 136px Stepper and
  two 44px IconButtons, with 8px gaps), so each row keeps its height (F25). W11 turns this into
  the WAI-ARIA grid with one tab stop; every day's DayMark is its cell's one widget.
-->
<template>
  <div class="relative overflow-x-auto print:overflow-visible">
    <table
      role="table"
      :aria-label="tableLabel"
      class="w-full table-fixed border-collapse tabular-nums"
      :class="
        // Wide enough that a day column never drops below 56px: the name and Week columns plus
        // 7 × 56 (600px on a phone and 680px above, as the card's 600px minimum assumes).
        configMode ? 'min-w-212 sm:min-w-232' : 'min-w-150 sm:min-w-170'
      "
    >
      <colgroup>
        <col :class="configMode ? 'w-96 sm:w-112' : 'w-34 sm:w-50'" />
        <col v-for="d in days" :key="d.key" />
        <col class="w-18 sm:w-22" />
      </colgroup>
      <thead>
        <tr role="row" class="border-b border-ink">
          <th scope="col" role="columnheader" class="p-0">
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
          :flags="flagsFor(it.id)"
          :total="totalFor(it.id)"
          @toggle="$emit('toggle', it.id, $event)"
          @change-target="$emit('changeTarget', it.id, $event)"
          @remove="$emit('remove', it.id)"
          @edit="$emit('edit', it.id)"
        />
      </tbody>

      <!-- On paper a split table repeats its header, but the Picked row prints once, at the end. -->
      <tfoot v-if="picked" class="print:table-row-group">
        <tr role="row">
          <th scope="row" role="rowheader" class="py-3 pr-3 text-left align-top font-normal">
            <span class="body block text-ink">Picked</span>
            <span class="caption block text-ink-secondary">{{ picked.caption }}</span>
          </th>
          <td
            v-for="(c, i) in picked.counts"
            :key="i"
            role="cell"
            class="px-0.5 py-3 text-center align-top"
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
          <!-- Nothing to total for the picks (the section's figure counts the week), so the cell is
               out of the accessibility tree and never takes focus. -->
          <td aria-hidden="true" class="p-0" />
        </tr>
      </tfoot>
    </table>
  </div>
</template>
