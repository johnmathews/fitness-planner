<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePlannerStore } from '@/stores/planner'
import { useDietStore } from '@/stores/diet'
import { dayMonth } from '@/lib/dates'
import type { Food } from '@/lib/storage'
import { SectionHeader } from '@/components/ui/section-header'
import { StatFigure } from '@/components/ui/stat-figure'
import TrackerGrid from '@/components/TrackerGrid.vue'
import AddFoodForm from '@/components/AddFoodForm.vue'
import EditFoodDialog from '@/components/EditFoodDialog.vue'

const planner = usePlannerStore()
const diet = useDietStore()

function flagsFor(id: string): boolean[] {
  return planner.days.map((_, i) => diet.isEaten(id, i))
}

const editing = ref<Food | null>(null)

function edit(id: string): void {
  editing.value = diet.foods.find((f) => f.id === id) ?? null
}

// As in ExerciseGrid: close the dialog if another tab deletes the food, or if the week changes
// under it, rather than save into a week the user didn't open it for.
watch(
  () => diet.foods,
  (list) => {
    if (editing.value && !list.some((f) => f.id === editing.value!.id)) editing.value = null
  },
)
watch(
  () => planner.weekKey,
  () => (editing.value = null),
)
</script>

<!--
  The Food section: the same WeekGrid without chips and without the Picked row (foods have no
  daily pick), under its own SectionHeader whose figure counts the foods whose goal is met. A
  line rule and space-8 set it apart from Exercises. On paper the heading and the grid stay on
  one page (F20): the header avoids a break after it, and the pair avoids a break inside.
-->
<template>
  <section
    class="mt-8 border-t border-line pt-8 print:mt-4 print:border-0 print:pt-4"
    aria-labelledby="diet-heading"
  >
    <div class="print:break-inside-avoid" data-print-keep>
      <SectionHeader title="Food" heading-id="diet-heading">
        <StatFigure
          v-if="planner.showTotals"
          :figure="diet.goalsMet"
          :total="diet.foods.length"
          words="goals met"
          :met="diet.foods.length > 0 && diet.goalsMet === diet.foods.length"
          data-testid="diet-goals-met"
        />
      </SectionHeader>
      <TrackerGrid
        label="Food"
        :table-label="`Food, week of ${dayMonth(planner.monday)}`"
        :items="diet.foods"
        :days="planner.days"
        :flags-for="flagsFor"
        :total-for="diet.totalFor"
        editable
        :config-mode="planner.configMode"
        data-testid="diet-grid"
        @toggle="diet.toggle"
        @remove="diet.removeFood"
        @edit="edit"
      />
    </div>
    <AddFoodForm v-if="planner.configMode" />
    <EditFoodDialog v-if="editing" :food="editing" @close="editing = null" />
  </section>
</template>
