<script setup lang="ts">
import { ref } from 'vue'
import { useDietStore } from '@/stores/diet'
import { MAX_NOTES, MAX_TARGET, MIN_TARGET, NEW_FOOD_TARGET, type Food } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Stepper } from '@/components/ui/stepper'
import { TextArea } from '@/components/ui/text-area'
import { TextField } from '@/components/ui/text-field'

const props = defineProps<{
  /** The food to edit; left out, the dialog adds a new one (K54). */
  food?: Food
}>()
const emit = defineEmits<{ close: [] }>()

const diet = useDietStore()
const name = ref(props.food?.name ?? '')
const target = ref(props.food?.target ?? NEW_FOOD_TARGET)
const notes = ref(props.food?.notes ?? '')
/** Add or edit: the title, the fields' ids and the primary action follow. */
const adding = !props.food
const id = adding ? 'add-food' : 'edit-food'
/** The Dialog card's hint under Note (K43). */
const NOTE_HINT = 'Markdown works: **bold**, *italic*, links.'

function save(): void {
  const input = { name: name.value, target: target.value, notes: notes.value }
  const ok = props.food ? diet.updateFood(props.food.id, input) : diet.addFood(input)
  if (ok) emit('close')
}
</script>

<!-- The Dialog card's Edit food, or Add food when no food is given (K54): Name, Times a week,
     then the Note last, as in the exercise's dialog (K55). Open for as long as it is mounted, like EditExerciseDialog; the Dialog returns focus to
     the button that opened it. -->
<template>
  <Dialog :open="true" :title="adding ? 'Add food' : 'Edit food'" @update:open="emit('close')">
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
      <Stepper
        :id="`${id}-target`"
        v-model="target"
        label="Times a week"
        lower-label="Fewer times a week"
        raise-label="More times a week"
        :min="MIN_TARGET"
        :max="MAX_TARGET"
      />
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
        adding ? 'Add food' : 'Save'
      }}</Button>
    </template>
  </Dialog>
</template>
