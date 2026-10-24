<script setup lang="ts">
import { computed } from 'vue'
import { usePlannerStore } from '@/stores/planner'
import { useDietStore } from '@/stores/diet'
import { addDays, dayMonth, fromKey, weekLabel } from '@/lib/dates'
import { useConfirm } from '@/composables/useConfirm'
import { Button } from '@/components/ui/button'

const store = usePlannerStore()
const diet = useDietStore()

const { confirm } = useConfirm()
const label = (key: string | null) => (key ? weekLabel(fromKey(key)) : null)

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

<template>
  <section class="flex flex-wrap items-end justify-between gap-3 pt-8 pb-2 print:pt-0">
    <div class="flex flex-col gap-1">
      <h1 class="display">{{ store.label }}</h1>
      <p class="text-sm text-ink-secondary" data-testid="pick-hint">
        Pick {{ store.dailyPick }} exercises a day. Click a cell when it’s done.
      </p>
      <div
        v-if="store.configMode"
        class="flex flex-wrap items-center gap-x-3 gap-y-2 pt-2"
        data-noprint
      >
        <Button size="sm" @click="copyToNextWeek">Copy plan to next week</Button>
        <span v-if="carriedNote" class="text-xs text-ink-secondary" data-testid="carried-from">
          {{ carriedNote }}
        </span>
      </div>
    </div>
    <div class="flex items-baseline gap-1.5">
      <div class="text-3xl font-semibold text-pen tabular-nums" data-testid="grand-total">
        {{ store.grandTotal }}
      </div>
      <div class="text-sm text-ink-secondary">sessions this week</div>
    </div>
  </section>
</template>
