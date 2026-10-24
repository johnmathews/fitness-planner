<script setup lang="ts">
import { INKS } from '@/lib/inks'
import ExampleGroup from '../parts/ExampleGroup.vue'

/** The colour roles (tokens.css), each named as its variable. */
const ROLES = [
  'canvas',
  'panel',
  'tile',
  'line',
  'control-border',
  'ink',
  'on-ink',
  'ink-secondary',
  'error-ink',
  'focus',
  'pen',
  'highlight',
  'caution-ink',
] as const
</script>

<!-- Swatches read the variables, so they follow the theme; `pen` also follows the ink switch,
     which is otherwise invisible until the planner components arrive. -->
<template>
  <div class="flex flex-col gap-8">
    <ExampleGroup title="Roles">
      <ul class="grid w-full grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        <li v-for="role in ROLES" :id="`sg-colour-${role}`" :key="role" class="flex flex-col gap-1">
          <span
            class="h-12 rounded-md border border-line"
            :style="{ background: `var(--${role})` }"
            aria-hidden="true"
          />
          <span class="caption">{{ role }}</span>
        </li>
      </ul>
    </ExampleGroup>
    <ExampleGroup title="Inks (the pen choices)">
      <ul class="grid w-full grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        <li
          v-for="ink in INKS"
          :id="`sg-colour-ink-${ink.id}`"
          :key="ink.id"
          class="flex flex-col gap-1"
        >
          <span
            class="h-12 rounded-md border border-line"
            :style="{ background: `var(--${ink.id})` }"
            aria-hidden="true"
          />
          <span class="caption">{{ ink.name }}</span>
        </li>
      </ul>
    </ExampleGroup>
  </div>
</template>
