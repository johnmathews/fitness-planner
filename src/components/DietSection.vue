<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePlannerStore } from '@/stores/planner'
import { useDietStore } from '@/stores/diet'
import { dayMonth } from '@/lib/dates'
import type { Food, Mark } from '@/lib/storage'
import { SCREEN, SCREEN_GRID } from '@/lib/screens'
import { SectionHeader } from '@/components/ui/section-header'
import TrackerGrid from '@/components/TrackerGrid.vue'
import AddFoodForm from '@/components/AddFoodForm.vue'
import EditFoodDialog from '@/components/EditFoodDialog.vue'

const planner = usePlannerStore()
const diet = useDietStore()

function marksFor(id: string): (Mark | null)[] {
  return planner.days.map((_, i) => diet.markOf(id, i))
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
  daily pick), under its own SectionHeader. A
  line rule and space-8 set it apart from Exercises. On paper the heading and the grid stay on
  one page (F20): the header avoids a break after it, and the pair avoids a break inside. On the
  planner's screens it is the second screen, with nothing ruling it off.
-->
<template>
  <section
    class="mt-8 border-t border-line pt-8 print:mt-4 print:border-0 print:pt-4 full:mt-0 full:border-0"
    :class="SCREEN"
    data-planner-screen
    aria-labelledby="diet-heading"
  >
    <div
      class="print:break-inside-avoid full:flex full:min-h-0 full:flex-1 full:flex-col folded:flex-none"
      data-print-keep
    >
      <SectionHeader title="Food" heading-id="diet-heading" :week="planner.label" />
      <TrackerGrid
        :class="SCREEN_GRID"
        label="Food"
        :mark-set="planner.markSet"
        :table-label="`Food, week of ${dayMonth(planner.monday)}`"
        :items="diet.foods"
        :days="planner.days"
        :marks-for="marksFor"
        editable
        :config-mode="planner.configMode"
        data-testid="diet-grid"
        @toggle="diet.toggle"
        @remove="diet.removeFood"
        @edit="edit"
      >
        <template #corner>
          <span class="title-1 text-[24px] leading-7 text-ink">Food</span>
        </template>
      </TrackerGrid>
    </div>
    <AddFoodForm v-if="planner.configMode" />
    <EditFoodDialog v-if="editing" :food="editing" @close="editing = null" />
  </section>
</template>
