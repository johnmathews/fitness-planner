<script setup lang="ts">
import { computed, reactive, ref, type Directive } from 'vue'
import { todaySummary, type TodayItem } from '@/lib/tracker'
import { SegmentedControl } from '@/components/ui/segmented-control'
import TodayList from '@/components/TodayList.vue'
import ExampleGroup from '../parts/ExampleGroup.vue'
import StateExample from '../parts/StateExample.vue'

// The card's day (components/TodayList/preview.html): Thursday 22 October, a pick of three, two
// exercises done.
const DATE = 'Thursday 22 October'
const PICK = 3

const exercises = reactive<TodayItem[]>([
  { id: 'pu', name: 'Push-ups', chips: ['3 × 12'], done: true, total: 3, target: 4 },
  { id: 'pl', name: 'Pull-ups', chips: ['3 × 5'], done: false, total: 1, target: 3 },
  { id: 'sq', name: 'Squats', chips: ['3 × 15', '16 kg'], done: true, total: 3, target: 3 },
  { id: 'kh', name: 'Kettlebell halos', chips: ['8 each side'], done: false, total: 1, target: 2 },
])
const foods = reactive<TodayItem[]>([
  { id: 'veg', name: 'Vegetables', done: true, total: 5, target: 7 },
  { id: 'fruit', name: 'Fruit', done: false, total: 3, target: 5 },
  { id: 'fish', name: 'Fish', done: false, total: 1, target: 2 },
  { id: 'nuts', name: 'Nuts', done: true, total: 2, target: 3 },
])

/** A mark flips today and moves the week's count with it; nothing is saved. */
function toggle(kind: 'exercise' | 'food', id: string): void {
  const item = (kind === 'exercise' ? exercises : foods).find((x) => x.id === id)!
  item.done = !item.done
  item.total += item.done ? 1 : -1
}

const view = ref('today')
const VIEWS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
]

/** The card's summary table, done today against a pick of three. */
const SUMMARIES = computed(() => [0, 2, 3, 4].map((n) => [n, todaySummary(n, PICK)] as const))

/**
 * In the app TodayList is the page: the date is its h1 and Exercises and Food are h2s. Here it
 * sits under this section's h2, so `v-nested-headings` moves its headings two levels down
 * (aria-level 3 and 4) and the page's outline stays in order (axe heading-order).
 */
function nestHeadings(frame: HTMLElement): void {
  for (const h of frame.querySelectorAll('h1, h2')) {
    h.setAttribute('aria-level', String(Number(h.tagName.slice(1)) + 2))
  }
}
const vNestedHeadings: Directive<HTMLElement> = { mounted: nestHeadings, updated: nestHeadings }
</script>

<!-- The card's phone column, drawn by the app's own TodayList inside a 390px frame: the view switch,
     the band, the summary, then Exercises and Food. Marks toggle; nothing is saved. In the app the
     list is the page's h1 and shows only below 640px. -->
<template>
  <ExampleGroup>
    <StateExample state="On a phone. Today is Thursday; the pick is three a day.">
      <div
        id="sg-today-list-screen"
        v-nested-headings
        class="w-full max-w-[390px] overflow-hidden rounded-lg border border-line bg-canvas px-4"
      >
        <div class="flex justify-end pt-3">
          <SegmentedControl v-model="view" ariaLabel="View" :options="VIEWS" />
        </div>
        <TodayList
          :date="DATE"
          :pick="PICK"
          :exercises="exercises"
          :foods="foods"
          @toggle="toggle"
        />
      </div>
    </StateExample>
    <StateExample state="Nothing planned this week">
      <div
        id="sg-today-list-empty"
        v-nested-headings
        class="w-full max-w-[390px] overflow-hidden rounded-lg border border-line bg-canvas px-4"
      >
        <TodayList :date="DATE" :pick="PICK" :exercises="[]" :foods="[]" />
      </div>
    </StateExample>
  </ExampleGroup>
  <ExampleGroup title="Summary, pick of three">
    <dl class="grid w-full max-w-160 grid-cols-[auto_1fr] gap-x-6 gap-y-2">
      <template v-for="[n, words] in SUMMARIES" :key="n">
        <dt class="text-base font-semibold text-ink">{{ n }} done</dt>
        <dd class="body-large text-ink">{{ words }}</dd>
      </template>
    </dl>
  </ExampleGroup>
</template>
