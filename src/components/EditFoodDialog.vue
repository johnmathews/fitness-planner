<script setup lang="ts">
import { ref } from 'vue'
import { useDietStore } from '@/stores/diet'
import { MAX_NOTES, MAX_TARGET, MIN_TARGET, type Food } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Stepper } from '@/components/ui/stepper'
import { TextArea } from '@/components/ui/text-area'
import { TextField } from '@/components/ui/text-field'

const props = defineProps<{ food: Food }>()
const emit = defineEmits<{ close: [] }>()

const diet = useDietStore()
const name = ref(props.food.name)
const target = ref(props.food.target)
const notes = ref(props.food.notes ?? '')
/** The Dialog card's hint under Note (K43). */
const NOTE_HINT = 'Markdown works: **bold**, *italic*, links.'

function save(): void {
  const input = { name: name.value, target: target.value, notes: notes.value }
  if (diet.updateFood(props.food.id, input)) emit('close')
}
</script>

<!-- The Dialog card's Edit food: Name, Note, then Times a week. Open for as long as it is mounted, like
     EditExerciseDialog; the Dialog returns focus to the Edit button that opened it. -->
<template>
  <Dialog :open="true" title="Edit food" @update:open="emit('close')">
    <form id="edit-food-form" class="flex flex-col gap-4" @submit.prevent="save">
      <TextField
        id="edit-food-name"
        v-model="name"
        label="Name"
        required
        pattern=".*\S.*"
        title="Enter a name"
      />
      <TextArea
        id="edit-food-notes"
        v-model="notes"
        label="Note"
        :hint="NOTE_HINT"
        :max-length="MAX_NOTES"
        :maxlength="MAX_NOTES"
        rows="3"
      />
      <Stepper
        id="edit-food-target"
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
      <Button type="submit" form="edit-food-form" variant="primary">Save</Button>
    </template>
  </Dialog>
</template>
