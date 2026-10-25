<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import type { Mark } from '@/lib/storage'
import { BOX_PATH, MARK_PATHS, MARK_STROKES, dayMarkLabel } from '.'

const props = withDefaults(
  defineProps<{
    /** The row: "Push-ups", "Fish". */
    name: string
    /** The full date for the name: "Thursday 22 October". The visible header can stay "Thu 22". */
    date: string
    /** The day's mark, or `null` for an empty box. */
    mark: Mark | null
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
  56 × 60px cell, drawing a hand-drawn box about 30px across in control-border. A marked day adds a
  marker stroke that runs a little past the box: a full squiggle (great), a half one (partial) or
  a cross (missed), each in its own pen. The rest of the cell is quiet space, so the 2px focus
  ring at 2px offset never touches a neighbour.
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
      :aria-pressed="mark !== null"
      :aria-label="label"
      :aria-current="today ? 'date' : undefined"
      @click="$emit('toggle')"
    >
      <svg
        data-slot="day-mark-box"
        aria-hidden="true"
        viewBox="0 0 36 36"
        :data-mark="mark ?? undefined"
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
              mark === null && 'group-hover:stroke-ink',
            )
          "
        />
        <path
          v-if="mark"
          :d="MARK_PATHS[mark]"
          data-slot="day-mark-stroke"
          stroke-width="3.5"
          :class="MARK_STROKES[mark]"
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
