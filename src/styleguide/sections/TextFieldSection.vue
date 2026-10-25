<script setup lang="ts">
import { ref } from 'vue'
import { TextField } from '@/components/ui/text-field'
import ExampleGroup from '../parts/ExampleGroup.vue'
import StateExample from '../parts/StateExample.vue'

// Live values, so typing in the examples works as it does in the app.
const username = ref('')
const password = ref('')
const weight = ref('')
const repeat = ref('correct-horse')
</script>

<!-- The card's states (components/TextField/preview.html), in its copy. The ids go to the
     <input>; the hint and error ids derive from them. -->
<template>
  <ExampleGroup layout="grid">
    <StateExample state="Default" class="w-full">
      <TextField
        id="sg-text-field-default"
        v-model="username"
        label="Email"
        autocomplete="username"
        autocapitalize="none"
        spellcheck="false"
        class="w-full"
      />
    </StateExample>
    <StateExample state="With a hint" class="w-full">
      <TextField
        id="sg-text-field-hint"
        v-model="password"
        label="Password"
        type="password"
        autocomplete="new-password"
        hint="At least 10 characters."
        class="w-full"
      />
    </StateExample>
    <StateExample
      state="Empty, the placeholder says what that means; focus (Tab to it)"
      class="w-full"
    >
      <TextField
        id="sg-text-field-empty"
        v-model="weight"
        label="Weight in kg"
        inputmode="decimal"
        placeholder="Bodyweight"
        class="w-full"
      />
    </StateExample>
    <StateExample state="Error" class="w-full">
      <TextField
        id="sg-text-field-error"
        v-model="repeat"
        label="Repeat password"
        type="password"
        autocomplete="new-password"
        error="The passwords don't match. Type the same password in both fields."
        class="w-full"
      />
    </StateExample>
    <StateExample state="Disabled" class="w-full">
      <TextField
        id="sg-text-field-disabled"
        model-value="anna"
        label="Email"
        disabled
        class="w-full"
      />
    </StateExample>
  </ExampleGroup>
</template>
