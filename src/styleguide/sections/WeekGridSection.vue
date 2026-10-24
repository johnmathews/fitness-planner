<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { Day } from '@/stores/planner'
import { DAY_NAMES, addDays, dateKey, fullDate } from '@/lib/dates'
import { dayCounts, pickedCount, totalFor, toggleDay, type Tracked } from '@/lib/tracker'
import type { Log } from '@/lib/storage'
import { Switch } from '@/components/ui/switch'
import TrackerGrid from '@/components/TrackerGrid.vue'
import ExampleGroup from '../parts/ExampleGroup.vue'
import StateExample from '../parts/StateExample.vue'

// The card's week (components/WeekGrid/preview.html): Monday 19 October, today Thursday, a pick
// of three, and Thursday one over it.
const MONDAY = new Date(2026, 9, 19)
const TODAY = 3
const PICK = 3
const WEEK = 'sg'

const days: Day[] = DAY_NAMES.map((name, i) => {
  const d = addDays(MONDAY, i)
  return {
    name,
    date: String(d.getDate()),
    full: fullDate(d),
    key: dateKey(d),
    isToday: i === TODAY,
    isFuture: i > TODAY,
  }
})

type Row = Tracked & { chips: string[] }
const rows = reactive<Row[]>([
  { id: 'pu', name: 'Push-ups', target: 4, chips: ['3 × 12'] },
  { id: 'pl', name: 'Pull-ups', target: 3, chips: ['3 × 5'] },
  { id: 'sq', name: 'Squats', target: 3, chips: ['3 × 15', '16 kg'] },
  { id: 'kh', name: 'Kettlebell halos', target: 2, chips: ['8 each side'] },
])
const T = true
const F = false
const log = reactive<Log>({
  [WEEK]: {
    pu: [T, F, T, T, F, F, F],
    pl: [T, F, F, T, F, F, F],
    sq: [F, T, T, T, F, F, F],
    kh: [F, T, F, T, F, F, F],
  },
})
const week = computed(() => log[WEEK]!)
const editing = ref(false)

/** The grid's keys (WeekGrid card, Accessibility; src/composables/gridNav.ts). */
const KEYS: [string, string][] = [
  ['Tab', 'Lands once on the grid: today’s first mark, or the last cell used. Tab again leaves.'],
  ['Arrows', 'Move cell by cell: names, days, totals and the Picked row. Never wrap.'],
  ['Home, End', 'First and last cell in the row.'],
  ['Ctrl+Home, Ctrl+End', 'First and last cell of the grid.'],
  ['Space, Enter', 'Toggle a day’s mark. Nothing on any other cell.'],
  ['Enter or F2, Escape', 'In Edit plan, on a name: into its goal, Edit and Remove; Escape back.'],
]

const picked = computed(() => ({
  caption: `${PICK} a day`,
  counts: dayCounts(rows, week.value).map((n, i) => pickedCount(n, PICK, days[i]!.isFuture)),
}))

function flagsFor(id: string): boolean[] {
  return week.value[id] ?? []
}
function changeTarget(id: string, delta: number): void {
  const row = rows.find((r) => r.id === id)!
  row.target = Math.max(0, Math.min(7, row.target + delta))
}
function remove(id: string): void {
  rows.splice(
    rows.findIndex((r) => r.id === id),
    1,
  )
}
</script>

<!-- The card's grid, drawn by the app's own TrackerGrid: today's band, the totals, the Picked row
     with Thursday one over the pick, and Edit plan. Marks toggle; nothing is saved. -->
<template>
  <ExampleGroup>
    <StateExample state="On screen. Today is Thursday; the pick is three a day." class="w-full">
      <Switch v-model="editing" label="Edit plan" />
      <div id="sg-week-grid-screen" class="w-full">
        <TrackerGrid
          label="Exercise"
          table-label="Exercises, week of 19 October"
          :items="rows"
          :days="days"
          :flags-for="flagsFor"
          :total-for="(id) => totalFor(week, id)"
          :details-for="(item) => (item as Row).chips"
          editable
          :config-mode="editing"
          :picked="picked"
          @toggle="(id, day) => toggleDay(log, WEEK, id, day)"
          @change-target="changeTarget"
          @remove="remove"
        />
      </div>
    </StateExample>
  </ExampleGroup>
  <ExampleGroup title="Keyboard">
    <dl
      class="grid w-full max-w-160 grid-cols-[auto_1fr] gap-x-6 gap-y-2"
      data-testid="sg-week-grid-keys"
    >
      <template v-for="[key, does] in KEYS" :key="key">
        <dt class="text-base font-semibold text-ink">{{ key }}</dt>
        <dd class="text-base text-ink">{{ does }}</dd>
      </template>
    </dl>
  </ExampleGroup>
</template>
