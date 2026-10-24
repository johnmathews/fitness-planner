<script setup lang="ts">
import type { Day } from '@/stores/planner'
import type { CountTone, Tracked } from '@/lib/tracker'
import TrackerRow from '@/components/TrackerRow.vue'

defineProps<{
  /** First-column header: "Exercise" or "Food". */
  label: string
  tableLabel: string
  items: Tracked[]
  days: Day[]
  flagsFor: (id: string) => boolean[]
  totalFor: (id: string) => number
  detailsFor?: (item: Tracked) => string[]
  /** Adds an edit button to each row, which emits `edit`. */
  editable?: boolean
  configMode: boolean
  footerLabel: string
  counts: { text: string; tone: CountTone }[]
  grandTotal: number
}>()
const LABEL =
  'flex items-center py-2.5 text-[11px] font-semibold tracking-wider text-ink-secondary uppercase'
const HEAD = 'border-b border-line'
const COUNT = 'border-l bg-tile px-1 py-2.5 text-center text-sm font-semibold tabular-nums'
const TONE: Record<CountTone, string> = {
  met: 'text-pen',
  over: 'text-caution-ink',
  under: 'text-ink-secondary',
  plain: 'text-ink',
}

defineEmits<{
  toggle: [id: string, day: number]
  changeTarget: [id: string, delta: number]
  remove: [id: string]
  edit: [id: string]
}>()
</script>

<template>
  <div
    class="mt-4 overflow-x-auto rounded-xl border border-line bg-panel shadow-xs print:break-inside-avoid print:overflow-visible"
  >
    <div
      class="grid"
      :class="
        // Edit plan widens the last column to hold the goal Stepper (three 44px-wide parts).
        configMode
          ? 'min-w-[808px] grid-cols-[minmax(220px,1.7fr)_repeat(7,minmax(64px,1fr))_minmax(152px,0.9fr)]'
          : 'min-w-[780px] grid-cols-[minmax(220px,1.7fr)_repeat(7,minmax(64px,1fr))_minmax(124px,0.9fr)]'
      "
      role="table"
      :aria-label="tableLabel"
    >
      <div role="row" class="contents">
        <div role="columnheader" :class="[LABEL, HEAD, 'bg-tile px-4']">{{ label }}</div>
        <div
          v-for="d in days"
          :key="d.key"
          role="columnheader"
          :class="[
            HEAD,
            'flex flex-col gap-px border-l border-l-line px-1 py-2 text-center',
            // Not both: Tailwind's own utility order, not class order, would decide the winner.
            d.isToday ? 'bg-highlight' : 'bg-tile',
          ]"
          :data-today="d.isToday"
          data-testid="day-head"
        >
          <div class="text-xs font-semibold">{{ d.name }}</div>
          <div
            class="text-[11px] tabular-nums"
            :class="d.isToday ? 'text-ink' : 'text-ink-secondary'"
          >
            {{ d.date }}
          </div>
        </div>
        <div
          role="columnheader"
          :class="[LABEL, HEAD, 'justify-center border-l border-l-control-border bg-tile px-3']"
        >
          Week
        </div>
      </div>

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

      <div role="row" class="contents">
        <div role="rowheader" :class="[LABEL, 'bg-tile px-4']">{{ footerLabel }}</div>
        <div
          v-for="(c, i) in counts"
          :key="i"
          role="cell"
          :class="[COUNT, 'border-l-line', TONE[c.tone]]"
          :data-tone="c.tone"
          data-testid="day-count"
        >
          {{ c.text }}
        </div>
        <div role="cell" :class="[COUNT, 'border-l-control-border text-ink']">{{ grandTotal }}</div>
      </div>
    </div>
  </div>
</template>
