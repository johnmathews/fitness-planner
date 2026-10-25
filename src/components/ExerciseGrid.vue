<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { exerciseDetails, usePlannerStore } from '@/stores/planner'
import type { Exercise, Mark } from '@/lib/storage'
import { goalMet, pickedCount, type Tracked } from '@/lib/tracker'
import { dayMonth } from '@/lib/dates'
import { SectionHeader } from '@/components/ui/section-header'
import { StatFigure } from '@/components/ui/stat-figure'
import TrackerGrid from '@/components/TrackerGrid.vue'
import AddExerciseForm from '@/components/AddExerciseForm.vue'
import EditExerciseDialog from '@/components/EditExerciseDialog.vue'

const store = usePlannerStore()

/** The Picked row: each day's count against the daily pick, "one extra" over it (F3). */
const picked = computed(() => ({
  caption: `${store.dailyPick} a day`,
  counts: store.dayCounts.map((n, i) => pickedCount(n, store.dailyPick, store.days[i]!.isFuture)),
}))

/** The section's one figure: sessions done this week of the sum of the weekly goals. */
const goal = computed(() => store.exercises.reduce((sum, e) => sum + e.target, 0))

function marksFor(id: string): (Mark | null)[] {
  return store.days.map((_, i) => store.markOf(id, i))
}

// The grid hands back the item it was given, which is always an Exercise here.
function detailsFor(item: Tracked): string[] {
  return exerciseDetails(item as Exercise)
}

const editing = ref<Exercise | null>(null)

function edit(id: string): void {
  editing.value = store.exercises.find((e) => e.id === id) ?? null
}

// Another tab can delete the exercise while its dialog is open here; close it rather than leave
// a Save that can't apply.
watch(
  () => store.exercises,
  (list) => {
    if (editing.value && !list.some((e) => e.id === editing.value!.id)) editing.value = null
  },
)
// Saving edits the visible week, so if the week changes under an open dialog (the clock passing
// midnight on Sunday), close it rather than save into a week the user didn't open it for.
watch(
  () => store.weekKey,
  () => (editing.value = null),
)
</script>

<!-- The Exercises section (SectionHeader, StatFigure and WeekGrid cards): its heading and one
     figure, the week, and in Edit plan the add form. -->
<template>
  <section aria-labelledby="exercises-heading" class="pt-8 print:pt-4">
    <SectionHeader title="Exercises" heading-id="exercises-heading">
      <StatFigure
        v-if="store.showTotals"
        :figure="store.grandTotal"
        :total="goal"
        words="this week"
        :met="goalMet(store.grandTotal, goal)"
        data-testid="grand-total"
      />
    </SectionHeader>
    <TrackerGrid
      label="Exercise"
      :table-label="`Exercises, week of ${dayMonth(store.monday)}`"
      :items="store.exercises"
      :days="store.days"
      :marks-for="marksFor"
      :total-for="store.totalFor"
      :details-for="detailsFor"
      editable
      :config-mode="store.configMode"
      :picked="picked"
      data-testid="exercise-grid"
      @toggle="store.toggle"
      @remove="store.removeExercise"
      @edit="edit"
    />
    <AddExerciseForm v-if="store.configMode" />
    <EditExerciseDialog v-if="editing" :exercise="editing" @close="editing = null" />
  </section>
</template>
