<script setup lang="ts">
import { ref } from 'vue'
import { Stepper } from '@/components/ui/stepper'
import ExampleGroup from '../parts/ExampleGroup.vue'
import StateExample from '../parts/StateExample.vue'

// The daily picks in Edit plan run 1 to 8 (K56).
const MIN = 1
const MAX = 8

const normal = ref(3)
const reps = ref(12)
const atMin = ref(MIN)
const atMax = ref(MAX)
const perDay = ref(4)
</script>

<!-- The card's states (components/Stepper/preview.html). The ids go to the spinbutton. At a
     limit the button is aria-disabled, so focus stays on it. -->
<template>
  <ExampleGroup>
    <StateExample state="Default">
      <Stepper
        id="sg-stepper-pick-default"
        v-model="normal"
        label="Exercises a day"
        lower-label="Fewer exercises a day"
        raise-label="More exercises a day"
        :min="MIN"
        :max="MAX"
      />
    </StateExample>
    <StateExample state="Focus (Tab to it)">
      <Stepper
        id="sg-stepper-reps-focus"
        v-model="reps"
        label="Reps"
        lower-label="Fewer reps"
        raise-label="More reps"
        :min="1"
        :max="20"
      />
    </StateExample>
    <StateExample state="At the minimum">
      <Stepper
        id="sg-stepper-pick-min"
        v-model="atMin"
        label="Exercises a day"
        lower-label="Fewer exercises a day"
        raise-label="More exercises a day"
        :min="MIN"
        :max="MAX"
      />
    </StateExample>
    <StateExample state="At the maximum">
      <Stepper
        id="sg-stepper-pick-max"
        v-model="atMax"
        label="Exercises a day"
        lower-label="Fewer exercises a day"
        raise-label="More exercises a day"
        :min="MIN"
        :max="MAX"
      />
    </StateExample>
    <StateExample state="With a suffix, label hidden (Edit plan, K63)">
      <Stepper
        id="sg-stepper-pick-suffix"
        v-model="perDay"
        label="Exercises a day"
        lower-label="Fewer exercises a day"
        raise-label="More exercises a day"
        :min="MIN"
        :max="MAX"
        hide-label
        suffix="per day"
      />
    </StateExample>
    <StateExample state="Disabled">
      <Stepper
        id="sg-stepper-pick-disabled"
        :model-value="3"
        label="Exercises a day"
        lower-label="Fewer exercises a day"
        raise-label="More exercises a day"
        :min="MIN"
        :max="MAX"
        disabled
      />
    </StateExample>
  </ExampleGroup>
</template>
