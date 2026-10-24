<script setup lang="ts">
import { computed } from 'vue'
import { usePlannerStore } from '@/stores/planner'
import { useDietStore } from '@/stores/diet'
import { addDays, dayMonth, fromKey, weekOf } from '@/lib/dates'
import { useConfirm } from '@/composables/useConfirm'
import { Button } from '@/components/ui/button'

const store = usePlannerStore()
const diet = useDietStore()

const { confirm } = useConfirm()
const label = (key: string | null) =>
  key ? `the week of ${weekOf(fromKey(key), new Date())}` : null

/**
 * Says where a plan this week hasn't changed comes from. Exercises and foods get their own plans
 * separately, so name each when they differ. The source can be a later week (before the first plan).
 */
const carriedNote = computed(() => {
  const ex = label(store.carriedFrom)
  const food = label(diet.carriedFrom)
  if (!ex && !food) return null
  if (ex === food) return `Uses the plan from ${ex} until you change this week.`
  const parts = [ex && `exercises from ${ex}`, food && `foods from ${food}`].filter(Boolean)
  return `Uses the plan for ${parts.join(' and ')} until you change them this week.`
})

/** Copies exercises and foods (with their sets, reps, weights and goals), then shows that week. */
async function copyToNextWeek(): Promise<void> {
  // Asks only when next week has a plan of its own (exercises or foods), which the copy replaces.
  if (store.nextWeekHasPlan || diet.nextWeekHasPlan) {
    const yes = await confirm({
      title: 'Replace next week’s plan?',
      message: `The week of ${dayMonth(addDays(store.monday, 7))} already has its own plan. Copying replaces it with this week’s exercises and foods.`,
      confirmLabel: 'Replace',
    })
    if (!yes) return
  }
  store.copyToNextWeek()
  diet.copyToNextWeek()
  store.nextWeek()
}
</script>

<!--
  The page's one h1: the week, as the Header writes it ("19–25 October"), set in display above the
  sections (SectionHeader card). Each section brings its own heading and figure. In Edit plan the
  plan's own actions follow, off paper.
-->
<template>
  <div class="flex flex-col gap-3 pt-8 print:pt-0">
    <h1 class="display text-ink">{{ store.label }}</h1>
    <div v-if="store.configMode" class="flex flex-wrap items-center gap-x-3 gap-y-2" data-noprint>
      <Button size="sm" @click="copyToNextWeek">Copy plan to next week</Button>
      <span v-if="carriedNote" class="caption text-ink-secondary" data-testid="carried-from">
        {{ carriedNote }}
      </span>
    </div>
  </div>
</template>
