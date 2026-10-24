<script setup lang="ts">
import { ref } from 'vue'
import { TextArea } from '@/components/ui/text-area'
import ExampleGroup from '../parts/ExampleGroup.vue'
import StateExample from '../parts/StateExample.vue'

// The card's 2,000-character limit is an example; the consumer sets the real one.
const LIMIT = 2000

const empty = ref('')
const counted = ref('Left shoulder felt tight on the last set. Dropped to 10 kg.')
const tooLong = ref(
  'Warm-up: five minutes on the bike, then band pull-aparts and slow goblet squats before the first working set…',
)
</script>

<!-- The card's states (components/TextArea/preview.html), in its copy. Type into the counted
     example to see the count follow. -->
<template>
  <ExampleGroup layout="grid">
    <StateExample state="Default, empty" class="w-full">
      <TextArea
        id="sg-text-area-default"
        v-model="empty"
        label="Note"
        hint="Up to 2,000 characters."
        class="w-full"
      />
    </StateExample>
    <StateExample state="With text and a count; focus (Tab to it)" class="w-full">
      <TextArea
        id="sg-text-area-count"
        v-model="counted"
        label="Note"
        :max-length="LIMIT"
        class="w-full"
      />
    </StateExample>
    <StateExample state="Error" class="w-full">
      <TextArea
        id="sg-text-area-error"
        v-model="tooLong"
        label="Note"
        error="This note is 2,140 characters. Shorten it to 2,000 or fewer to save it."
        class="w-full"
      />
    </StateExample>
    <StateExample state="Disabled" class="w-full">
      <TextArea
        id="sg-text-area-disabled"
        model-value="Left shoulder felt tight on the last set. Dropped to 10 kg."
        label="Note"
        disabled
        class="w-full"
      />
    </StateExample>
  </ExampleGroup>
</template>
