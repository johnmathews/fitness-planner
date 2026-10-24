<script setup lang="ts">
import { usePlannerStore } from '@/stores/planner'
import { useExerciseForm } from '@/composables/exerciseForm'
import PerSideToggle from '@/components/PerSideToggle.vue'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'

const store = usePlannerStore()
const form = useExerciseForm()
const { name, sets, reps, weight, perSide } = form

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
      hint="Optional."
      maxlength="2"
      inputmode="numeric"
      class="w-20"
      @input="form.onSetsInput"
    />
    <TextField
      id="add-exercise-reps"
      :model-value="reps"
      label="Reps"
      inputmode="numeric"
      class="w-20"
      @input="form.onRepsInput"
    />
    <PerSideToggle v-model="perSide" />
    <TextField
      id="add-exercise-weight"
      :model-value="weight"
      label="Weight in kg"
      hint="Optional. Leave empty for bodyweight."
      inputmode="decimal"
      class="w-44"
      @input="form.onWeightInput"
    />
    <Button type="submit" variant="primary" class="mt-6">Add exercise</Button>
  </form>
</template>
