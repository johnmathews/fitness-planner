<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { TextField } from '@/components/ui/text-field'

const REPS_COUNT = [
  { value: 'per-set', label: 'Per set' },
  { value: 'each-side', label: 'Each side, per set' },
]

const open = ref(false)
const name = ref('Kettlebell halos')
const sets = ref('3')
const reps = ref('8')
const repsCount = ref('each-side')
const weight = ref('8')
</script>

<!-- The card's Edit exercise dialog (components/Dialog/preview.html). It opens from its trigger
     only, so nothing traps the page on load; focus goes to the first field and returns to the
     trigger on close. -->
<template>
  <Dialog v-model:open="open" title="Edit exercise">
    <template #trigger>
      <Button id="sg-dialog-open">Edit exercise</Button>
    </template>
    <TextField id="sg-dialog-edit-name" v-model="name" label="Name" required />
    <div class="flex flex-wrap items-start gap-4">
      <TextField
        id="sg-dialog-edit-sets"
        v-model="sets"
        label="Sets"
        inputmode="numeric"
        class="w-20"
      />
      <TextField
        id="sg-dialog-edit-reps"
        v-model="reps"
        label="Reps"
        inputmode="numeric"
        class="w-20"
      />
      <SegmentedControl
        id="sg-dialog-edit-reps-count"
        v-model="repsCount"
        label="Reps count"
        :options="REPS_COUNT"
      />
    </div>
    <TextField
      id="sg-dialog-edit-weight"
      v-model="weight"
      label="Weight in kg"
      inputmode="decimal"
      hint="Optional. Leave empty for bodyweight."
    />
    <template #actions>
      <Button @click="open = false">Cancel</Button>
      <Button variant="primary" @click="open = false">Save</Button>
    </template>
  </Dialog>
</template>
