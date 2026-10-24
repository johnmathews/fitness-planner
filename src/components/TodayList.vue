<script setup lang="ts">
import { computed } from 'vue'
import { todaySummary, type TodayItem } from '@/lib/tracker'
import { Chip } from '@/components/ui/chip'
import { DayMark } from '@/components/ui/day-mark'

const props = defineProps<{
  /** Today in full, as the heading and the marks' names say it: "Thursday 22 October". */
  date: string
  /** The daily pick the summary counts exercises against. */
  pick: number
  exercises: TodayItem[]
  foods: TodayItem[]
}>()

defineEmits<{ toggle: [kind: 'exercise' | 'food', id: string] }>()

/** "Two of three. One to go.": exercises only, since foods have no daily pick. */
const summary = computed(() =>
  todaySummary(props.exercises.filter((e) => e.done).length, props.pick),
)

const groups = computed(() =>
  [
    { kind: 'exercise' as const, title: 'Exercises', items: props.exercises },
    { kind: 'food' as const, title: 'Diet', items: props.foods },
  ].filter((g) => g.items.length > 0),
)
</script>

<!--
  The phone's first view (brand/design-system/project/components/TodayList, K5): the day's heading
  on the highlight band, which runs edge to edge (the band is today's column turned sideways), the
  summary in words, then Exercises and Diet as ordinary lists with line hairlines. Each row is the
  name, its chips and the week so far, and one DayMark on the right; the row itself isn't a
  button, so a scroll never marks a day. Marks go through the same store actions as the grid (the
  parent's `toggle`). Nothing here is a grid: Tab moves mark to mark, and the skip link finds the
  first one by `data-slot="today-list"`.

  The DayMark is the grid's own, named with the full date and "today" (DayMark card), in a 48px
  cell; its button is the grid's 44px. No Edit plan here: the plan is edited in the Week view.
-->
<template>
  <div data-slot="today-list" class="pb-6">
    <header data-testid="today-band" class="-mx-4 bg-highlight p-4">
      <h1 class="title-2 text-ink"><span class="sr-only">Today, </span>{{ date }}</h1>
      <p v-if="exercises.length > 0" data-testid="today-summary" class="body-large mt-1 text-ink">
        {{ summary }}
      </p>
    </header>
    <p v-if="groups.length === 0" data-testid="today-empty" class="body mt-6 text-ink-secondary">
      Nothing is planned this week. Switch to Week and turn on Edit plan to add exercises and foods.
    </p>
    <section v-for="g in groups" :key="g.kind" :aria-labelledby="`today-${g.kind}`">
      <h2 :id="`today-${g.kind}`" class="label pt-6 pb-2 text-ink-secondary">{{ g.title }}</h2>
      <ul class="-mx-4 border-t border-line">
        <li v-for="it in g.items" :key="it.id" class="border-b border-line py-2 pr-2 pl-4">
          <div class="flex min-h-12 items-center gap-3">
            <div class="min-w-0 flex-auto">
              <span class="block font-semibold break-words text-ink" data-testid="item-name">{{
                it.name
              }}</span>
              <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Chip v-for="c in it.chips" :key="c" data-testid="item-detail">{{ c }}</Chip>
                <span class="caption text-ink-secondary" data-testid="item-week"
                  >{{ it.total }} of {{ it.target }} this week</span
                >
              </span>
            </div>
            <DayMark
              class="h-12 w-12 shrink-0"
              :name="it.name"
              :date="date"
              today
              :done="it.done"
              @toggle="$emit('toggle', g.kind, it.id)"
            />
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>
