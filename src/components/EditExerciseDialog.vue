<script setup lang="ts">
import { usePlannerStore } from '@/stores/planner'
import { MAX_TARGET, MIN_TARGET, type Exercise } from '@/lib/storage'
import { MEASURE_OPTIONS, useExerciseForm } from '@/composables/exerciseForm'
import PerSideToggle from '@/components/PerSideToggle.vue'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Stepper } from '@/components/ui/stepper'
import { TextField } from '@/components/ui/text-field'

const props = defineProps<{ exercise: Exercise }>()
const emit = defineEmits<{ close: [] }>()

const store = usePlannerStore()
const form = useExerciseForm()
const { name, sets, reps, weight, perSide, measure, measureChoice, amountLabel, target } = form
form.load(props.exercise)

function save(): void {
  if (store.updateExercise(props.exercise.id, form.value())) emit('close')
}
</script>

<!-- Open for as long as it is mounted: Escape, Close, Cancel and a good Save all ask the list to
     drop it, and the Dialog returns focus to the Edit button that opened it. The actions sit
     outside the form in the Dialog's own row, so Save names the form. -->
<template>
  <Dialog :open="true" title="Edit exercise" @update:open="emit('close')">
    <form id="edit-exercise-form" class="flex flex-col gap-4" @submit.prevent="save">
      <TextField
        id="edit-exercise-name"
        v-model="name"
        label="Name"
        required
        pattern=".*\S.*"
        title="Enter a name"
      />
      <div class="flex flex-wrap items-start gap-4">
        <TextField
          id="edit-exercise-sets"
          :model-value="sets"
          label="Sets"
          hint="Optional."
          maxlength="2"
          inputmode="numeric"
          data-field="sets"
          class="w-20"
          @input="form.onSetsInput"
        />
        <SegmentedControl v-model="measureChoice" label="Measure" :options="MEASURE_OPTIONS" />
        <TextField
          id="edit-exercise-reps"
          :model-value="reps"
          :label="amountLabel"
          inputmode="numeric"
          maxlength="4"
          data-field="reps"
          class="w-20"
          @input="form.onRepsInput"
        />
        <PerSideToggle v-model="perSide" :timed="measure === 'time'" />
      </div>
      <TextField
        id="edit-exercise-weight"
        :model-value="weight"
        label="Weight in kg"
        hint="Optional. Leave empty for bodyweight."
        inputmode="decimal"
        placeholder="e.g. 12"
        class="w-44"
        @input="form.onWeightInput"
      />
      <Stepper
        id="edit-exercise-target"
        v-model="target"
        label="Times a week"
        lower-label="Fewer times a week"
        raise-label="More times a week"
        :min="MIN_TARGET"
        :max="MAX_TARGET"
      />
    </form>
    <template #actions>
      <Button @click="emit('close')">Cancel</Button>
      <Button type="submit" form="edit-exercise-form" variant="primary">Save</Button>
    </template>
  </Dialog>
</template>
