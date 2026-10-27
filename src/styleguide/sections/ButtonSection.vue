<script setup lang="ts">
import { Button } from '@/components/ui/button'
import ExampleGroup from '../parts/ExampleGroup.vue'
import StateExample from '../parts/StateExample.vue'

type Variant = 'primary' | 'secondary' | 'quiet'

/** The card's rows (components/Button/preview.html), in its copy. Quiet has no busy state there. */
const VARIANTS: readonly {
  variant: Variant
  title: string
  label: string
  busy?: string
  small: string
  disabled: string
}[] = [
  {
    variant: 'primary',
    title: 'Primary',
    label: 'Sign in',
    busy: 'Signing in…',
    small: 'Add exercise',
    disabled: 'Set password',
  },
  {
    variant: 'secondary',
    title: 'Secondary',
    label: 'Not mine',
    busy: 'Importing…',
    small: 'Export',
    disabled: 'Import…',
  },
  { variant: 'quiet', title: 'Quiet', label: 'Later', small: 'This week', disabled: 'Cancel' },
]
</script>

<template>
  <div class="flex flex-col gap-8">
    <ExampleGroup v-for="v in VARIANTS" :key="v.variant" :title="v.title">
      <StateExample state="Default">
        <Button :id="`sg-button-${v.variant}-default`" :variant="v.variant">{{ v.label }}</Button>
      </StateExample>
      <StateExample state="Focus (Tab to it)">
        <Button :id="`sg-button-${v.variant}-focus`" :variant="v.variant">{{ v.label }}</Button>
      </StateExample>
      <StateExample v-if="v.busy" state="Busy">
        <Button :id="`sg-button-${v.variant}-busy`" :variant="v.variant" busy>{{ v.busy }}</Button>
      </StateExample>
      <StateExample state="Small">
        <Button :id="`sg-button-${v.variant}-sm`" :variant="v.variant" size="sm">{{
          v.small
        }}</Button>
      </StateExample>
      <StateExample state="Disabled">
        <Button :id="`sg-button-${v.variant}-disabled`" :variant="v.variant" disabled>{{
          v.disabled
        }}</Button>
      </StateExample>
    </ExampleGroup>
  </div>
</template>
