<script setup lang="ts">
import { ref } from 'vue'
import { useDietStore } from '@/stores/diet'
import { MAX_TARGET, MIN_TARGET, type Food } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Stepper } from '@/components/ui/stepper'
import { TextField } from '@/components/ui/text-field'

const props = defineProps<{ food: Food }>()
const emit = defineEmits<{ close: [] }>()

const diet = useDietStore()
const name = ref(props.food.name)
const target = ref(props.food.target)

function save(): void {
  if (diet.updateFood(props.food.id, { name: name.value, target: target.value })) emit('close')
}
</script>

<!-- The Dialog card's Edit food: Name, then Times a week. Open for as long as it is mounted, like
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
