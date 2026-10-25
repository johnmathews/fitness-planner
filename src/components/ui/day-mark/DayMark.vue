<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { markDrawing, markKind, type Mark } from '@/lib/storage'
import { BOX_PATH, MARK_DRAWINGS, MARK_PENS, dayMarkLabel } from '.'

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
  One day of one row (brand/design-system/project/components/DayMark): a 64px button centred in a
  76px square cell, drawing a hand-drawn box about 45px across in control-border. A marked day fills
  it in its pen (green great, yellow partial, red missed) with the marker drawing its mark names
  (zigzag, solid or hatch), running a little past the box; the box is drawn over the fill, as a pen
  line shows through marker. The rest of the cell is quiet space, so the 2px focus ring at 2px
  offset never touches a neighbour.
-->
<template>
  <div
    data-slot="day-mark"
    :data-today="today"
    :class="cn('relative mx-auto grid size-19 place-items-center', props.class)"
  >
    <button
      type="button"
      data-slot="day-mark-button"
      class="group grid size-16 place-items-center rounded-md"
      :aria-pressed="mark !== null"
      :aria-label="label"
      :aria-current="today ? 'date' : undefined"
      @click="$emit('toggle')"
    >
      <svg
        data-slot="day-mark-box"
        aria-hidden="true"
        viewBox="0 0 36 36"
        :data-mark="mark ? markKind(mark) : undefined"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-15 overflow-visible"
      >
        <path
          v-if="mark"
          :d="MARK_DRAWINGS[markDrawing(mark)]"
          data-slot="day-mark-stroke"
          :data-drawing="markDrawing(mark)"
          fill="currentColor"
          fill-rule="evenodd"
          stroke="none"
          :class="MARK_PENS[markKind(mark)]"
        />
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
