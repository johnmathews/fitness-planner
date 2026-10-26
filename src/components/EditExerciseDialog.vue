<script setup lang="ts">
import { usePlannerStore } from '@/stores/planner'
import { MAX_NOTES, MAX_TARGET, MIN_TARGET, type Exercise } from '@/lib/storage'
import { MEASURE_OPTIONS, useExerciseForm } from '@/composables/exerciseForm'
import PerSideToggle from '@/components/PerSideToggle.vue'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Stepper } from '@/components/ui/stepper'
import { TextArea } from '@/components/ui/text-area'
import { TextField } from '@/components/ui/text-field'

const props = defineProps<{
  /** The exercise to edit; left out, the dialog adds a new one (K54). */
  exercise?: Exercise
}>()
const emit = defineEmits<{ close: [] }>()

const store = usePlannerStore()
/** The Dialog card's hint under Note (K43). */
const NOTE_HINT = 'Markdown works: **bold**, *italic*, links.'
const form = useExerciseForm()
const { name, sets, reps, weight, perSide, measure, measureChoice, amountLabel, target, notes } =
  form
form.load(props.exercise)
/** Add or edit: the title, the fields' ids and the primary action follow. */
const adding = !props.exercise
const id = adding ? 'add-exercise' : 'edit-exercise'

function save(): void {
  const ok = props.exercise
    ? store.updateExercise(props.exercise.id, form.value())
    : store.addExercise(form.value())
  if (ok) emit('close')
}
</script>

<!-- Edit exercise, or Add exercise when no exercise is given (K54). Open for as long as it is
     mounted: Escape, Close, Cancel and a good Save (or Add exercise) all ask the list to drop it,
     and the Dialog returns focus to the button that opened it. The actions sit outside the form
     in the Dialog's own row, so the primary action names the form. -->
<template>
  <Dialog
    :open="true"
    :title="adding ? 'Add exercise' : 'Edit exercise'"
    @update:open="emit('close')"
  >
    <!-- Rows at the page's size (K55): the amount, then how it counts, the weight and the goal,
         then the note last, so the form fits a 1920×1200 screen. -->
    <form
      :id="`${id}-form`"
      class="flex flex-col gap-[max(16px,calc(var(--u)*20))]"
      @submit.prevent="save"
    >
      <TextField
        :id="`${id}-name`"
        v-model="name"
        label="Name"
        required
        pattern=".*\S.*"
        title="Enter a name"
      />
      <div
        class="flex flex-wrap items-start gap-x-[max(16px,calc(var(--u)*24))] gap-y-[max(16px,calc(var(--u)*20))]"
      >
        <TextField
          :id="`${id}-sets`"
          :model-value="sets"
          label="Sets"
          maxlength="2"
          inputmode="numeric"
          data-field="sets"
          class="w-[max(5rem,calc(var(--u)*96))]"
          @input="form.onSetsInput"
        />
        <SegmentedControl v-model="measureChoice" label="Measure" :options="MEASURE_OPTIONS" />
        <TextField
          :id="`${id}-reps`"
          :model-value="reps"
          :label="amountLabel"
          inputmode="numeric"
          maxlength="4"
          data-field="reps"
          class="w-[max(5rem,calc(var(--u)*96))]"
          @input="form.onRepsInput"
        />
      </div>
      <div
        class="flex flex-wrap items-start gap-x-[max(16px,calc(var(--u)*24))] gap-y-[max(16px,calc(var(--u)*20))]"
      >
        <PerSideToggle v-model="perSide" :timed="measure === 'time'" />
        <TextField
          :id="`${id}-weight`"
          :model-value="weight"
          label="Weight in kg"
          inputmode="decimal"
          placeholder="Bodyweight"
          class="w-[max(11rem,calc(var(--u)*170))]"
          @input="form.onWeightInput"
        />
        <Stepper
          :id="`${id}-target`"
          v-model="target"
          label="Times a week"
          lower-label="Fewer times a week"
          raise-label="More times a week"
          :min="MIN_TARGET"
          :max="MAX_TARGET"
        />
      </div>
      <TextArea
        :id="`${id}-notes`"
        v-model="notes"
        label="Note"
        :hint="NOTE_HINT"
        :max-length="MAX_NOTES"
        :maxlength="MAX_NOTES"
        rows="3"
      />
    </form>
    <template #actions>
      <Button @click="emit('close')">Cancel</Button>
      <Button type="submit" :form="`${id}-form`" variant="primary">{{
        adding ? 'Add exercise' : 'Save'
      }}</Button>
    </template>
  </Dialog>
</template>
