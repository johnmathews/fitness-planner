<script setup lang="ts">
import { computed } from 'vue'
import { Check } from '@lucide/vue'
import { statState } from '.'

const props = defineProps<{
  /** The count: sessions done, or foods whose goal is met. */
  figure: number
  /** What it is measured against: "of 12". */
  total: number
  /** The words after the total: "this week", "goals met". */
  words: string
  /** Whether the goal is met. Ignored at zero, which is always quiet. */
  met: boolean
}>()

const state = computed(() => statState(props.figure, props.met))

const FIGURE = {
  zero: 'text-ink-secondary font-normal',
  met: 'text-pen font-semibold',
  unmet: 'text-ink font-semibold',
} as const
</script>

<!--
  The one strong number in a section (brand/design-system/project/components/StatFigure): the
  figure at 22/28 tabular, then "of 12 this week" in body-large ink-secondary on its baseline.
  Met is pen plus a 16px check, so it never rests on colour alone: Graphite's pen is close to ink
  (F6). Plain text, not a live region: the DayMark that changed it already announces.
-->
<template>
  <p data-slot="stat-figure" :data-state="state" class="flex flex-wrap items-baseline gap-x-2">
    <span
      data-slot="stat-figure-value"
      :class="['text-[22px] leading-[28px] tabular-nums', FIGURE[state]]"
      >{{ figure }}</span
    >{{ ' '
    }}<span data-slot="stat-figure-words" class="body-large text-ink-secondary tabular-nums"
      >of {{ total }} {{ words }}</span
    >
    <Check
      v-if="state === 'met'"
      data-slot="met-mark"
      :size="16"
      :stroke-width="1.5"
      class="shrink-0 self-center text-pen"
    />
  </p>
</template>
