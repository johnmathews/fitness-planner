<script setup lang="ts">
import { ref } from 'vue'
import type { InkId } from '@/lib/inks'
import { InkPicker } from '@/components/ui/ink-picker'
import ExampleGroup from '../parts/ExampleGroup.vue'
import StateExample from '../parts/StateExample.vue'

const chosen = ref<InkId>('ink-blue')
const narrow = ref<InkId>('forest')
</script>

<!-- The card's states (components/InkPicker/preview.html). Choosing here changes only the example,
     not the page's pen; the ink switch at the top does that. -->
<template>
  <ExampleGroup layout="grid">
    <StateExample state="Ink blue chosen (the default); two columns when there is room">
      <InkPicker id="sg-ink-picker-default" v-model="chosen" class="w-full" />
    </StateExample>
    <StateExample state="Forest chosen, in the 296px Settings panel (one column)">
      <InkPicker id="sg-ink-picker-narrow" v-model="narrow" class="w-74 max-w-full" />
    </StateExample>
  </ExampleGroup>
</template>
