<script setup lang="ts">
import { usePlannerStore } from '@/stores/planner'
import { MEASURE_OPTIONS, useExerciseForm } from '@/composables/exerciseForm'
import PerSideToggle from '@/components/PerSideToggle.vue'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { TextField } from '@/components/ui/text-field'

const store = usePlannerStore()
const form = useExerciseForm()
const { name, sets, reps, weight, perSide, measure, measureChoice, amountLabel } = form

function submit(): void {
  if (store.addExercise(form.value())) form.load()
}
</script>

<!-- Labels above every field (F17); the numbers are cleaned as they're typed, so they take
     :model-value and an input handler rather than v-model. The button drops by a label's height
     (space-6) to line up with the fields. -->
<template>
  <form
    class="flex flex-wrap items-start gap-x-3 gap-y-4 pt-6"
    data-noprint
    @submit.prevent="submit"
  >
    <TextField
      id="add-exercise-name"
      v-model="name"
      label="New exercise"
      class="min-w-0 flex-[1_1_100%] sm:flex-[1_1_220px]"
    />
    <TextField
      id="add-exercise-sets"
      :model-value="sets"
      label="Sets"
      maxlength="2"
      inputmode="numeric"
      class="w-20"
      @input="form.onSetsInput"
    />
    <SegmentedControl v-model="measureChoice" label="Measure" :options="MEASURE_OPTIONS" />
    <TextField
      id="add-exercise-reps"
      :model-value="reps"
      :label="amountLabel"
      inputmode="numeric"
      maxlength="4"
      class="w-20"
      @input="form.onRepsInput"
    />
    <PerSideToggle v-model="perSide" :timed="measure === 'time'" />
    <TextField
      id="add-exercise-weight"
      :model-value="weight"
      label="Weight in kg"
      hint="Leave empty for bodyweight."
      inputmode="decimal"
      class="w-44"
      @input="form.onWeightInput"
    />
    <Button type="submit" variant="primary" class="mt-6">Add exercise</Button>
  </form>
</template>
