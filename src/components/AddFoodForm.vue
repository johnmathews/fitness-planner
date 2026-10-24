<script setup lang="ts">
import { ref } from 'vue'
import { useDietStore } from '@/stores/diet'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'

const store = useDietStore()
const name = ref('')

function submit(): void {
  if (store.addFood(name.value)) name.value = ''
}
</script>

<template>
  <form
    class="flex flex-wrap items-start gap-x-3 gap-y-4 pt-6"
    data-noprint
    @submit.prevent="submit"
  >
    <TextField
      id="add-food-name"
      v-model="name"
      label="New food"
      class="min-w-0 flex-[1_1_220px]"
    />
    <Button type="submit" variant="primary" class="mt-6">Add food</Button>
  </form>
</template>
