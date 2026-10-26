<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { exerciseDetails, usePlannerStore } from '@/stores/planner'
import type { Exercise, Mark } from '@/lib/storage'
import type { Tracked } from '@/lib/tracker'
import { dayMonth } from '@/lib/dates'
import { ChevronDown } from '@lucide/vue'
import { SCREEN, SCREEN_GRID } from '@/lib/screens'
import { IconButton } from '@/components/ui/icon-button'
import { sprintToScreen } from '@/composables/screenSprint'
import { SectionHeader } from '@/components/ui/section-header'
import TrackerGrid from '@/components/TrackerGrid.vue'
import AddExerciseForm from '@/components/AddExerciseForm.vue'
import EditExerciseDialog from '@/components/EditExerciseDialog.vue'

const store = usePlannerStore()

/** The days whose marked exercises reach the daily pick (K30): their column turns green. */
const metDays = computed(() => store.dayCounts.map((n) => n >= store.dailyPick))

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

<!-- The Exercises section (SectionHeader, WeekGrid and PlannerScreen cards): its heading, the
     week, and in Edit plan the add form. On the planner's screens it is
     the first screen: the slot's messages and the page's h1 at its top, the arrow to Food at its
     foot. -->
<template>
  <section
    aria-labelledby="exercises-heading"
    class="pt-8 print:pt-4"
    :class="SCREEN"
    data-planner-screen
  >
    <slot />
    <SectionHeader title="Exercises" heading-id="exercises-heading" :week="store.label" />
    <TrackerGrid
      :class="SCREEN_GRID"
      label="Exercise"
      :mark-set="store.markSet"
      :table-label="`Exercises, week of ${dayMonth(store.monday)}`"
      :items="store.exercises"
      :days="store.days"
      :marks-for="marksFor"
      :details-for="detailsFor"
      editable
      :config-mode="store.configMode"
      :met-days="metDays"
      data-testid="exercise-grid"
      @toggle="store.toggle"
      @remove="store.removeExercise"
      @edit="edit"
    >
      <template #corner>
        <span class="title-1 text-[24px] leading-7 text-ink">Exercises</span>
      </template>
    </TrackerGrid>
    <!-- The way on (PlannerScreen card, K42): an arrow, no words, sprinting to the Food screen. -->
    <IconButton
      label="Go to Food"
      class="hidden self-center text-ink-secondary hover:text-ink full:mt-[calc(var(--u)*10)] full:inline-flex short:hidden"
      data-noprint
      data-testid="to-food"
      @click="sprintToScreen('diet-heading')"
      ><ChevronDown :size="24"
    /></IconButton>
    <AddExerciseForm v-if="store.configMode" />
    <EditExerciseDialog v-if="editing" :exercise="editing" @close="editing = null" />
  </section>
</template>
