<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { BOX_PATH, SQUIGGLE_PATH, dayMarkLabel } from '.'

const props = withDefaults(
  defineProps<{
    /** The row: "Push-ups", "Fish". */
    name: string
    /** The full date for the name: "Thursday 22 October". The visible header can stay "Thu 22". */
    date: string
    done: boolean
    /** Adds "today" to the name and aria-current="date". The band is the grid cell's to draw. */
    today?: boolean
    /** Draws the folded corner and adds "has a note" to the name. Only where a note exists. */
    note?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { today: false, note: false, class: undefined },
)

defineEmits<{ toggle: [] }>()

const label = computed(() => dayMarkLabel(props))
</script>

<!--
  One day of one row (brand/design-system/project/components/DayMark): a 44px button centred in a
  56 × 60px cell, drawing a hand-drawn box about 30px across in control-border, filled with a pen
  marker squiggle when done. The rest of the cell is quiet space, so the 2px focus ring at 2px
  offset never touches a neighbour.
-->
<template>
  <div
    data-slot="day-mark"
    :data-today="today"
    :class="cn('relative mx-auto grid h-15 w-14 place-items-center', props.class)"
  >
    <button
      type="button"
      data-slot="day-mark-button"
      class="group grid size-11 place-items-center rounded-md"
      :aria-pressed="done"
      :aria-label="label"
      :aria-current="today ? 'date' : undefined"
      @click="$emit('toggle')"
    >
      <svg
        data-slot="day-mark-box"
        aria-hidden="true"
        viewBox="0 0 36 36"
        :data-on="done"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-10 overflow-visible"
      >
        <path
          :d="BOX_PATH"
          data-slot="day-mark-outline"
          stroke-width="1.75"
          :class="
            cn(
              'stroke-control-border motion-safe:transition-[stroke] motion-safe:duration-120 motion-safe:ease-out',
              !done && 'group-hover:stroke-ink',
            )
          "
        />
        <path
          v-if="done"
          :d="SQUIGGLE_PATH"
          data-slot="day-mark-squiggle"
          stroke-width="3.5"
          class="stroke-pen"
        />
      </svg>
    </button>
    <!-- NoteMark: a 10px folded corner in ink-secondary, flush in the cell's top-right corner. -->
    <span
      v-if="note"
      data-slot="note-mark"
      aria-hidden="true"
      class="pointer-events-none absolute top-0 right-0 size-2.5 bg-ink-secondary [clip-path:polygon(0_0,100%_0,100%_100%)]"
    />
  </div>
</template>
