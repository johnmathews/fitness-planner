<script lang="ts">
/**
 * Class lists the grid's cells share (WeekGrid card). On screen every cell draws its own row rule,
 * since a row is `display: contents` there and can't; folded, a row's name line has none.
 */
export const CELL = {
  /** A row's rule, on screen and on paper alike. */
  rule: 'screen:border-b screen:border-line',
}

/**
 * A day that met the daily pick (K35): a 6px pen line along the foot of its column, inset from the
 * column's edges so neighbouring days' lines stay apart. On paper too.
 */
const MET_LINE =
  'relative after:absolute after:inset-x-[12%] after:bottom-0 after:h-1.5 after:rounded-t-[3px] after:bg-pen'
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Pencil, Trash2 } from '@lucide/vue'
import type { Day } from '@/stores/planner'
import type { Mark, MarkSet } from '@/lib/storage'
import type { Tracked } from '@/lib/tracker'
import { useConfirm } from '@/composables/useConfirm'
import { Chip } from '@/components/ui/chip'
import { DayMark } from '@/components/ui/day-mark'
import { IconButton } from '@/components/ui/icon-button'

const props = defineProps<{
  /** The row's place in the grid, 0 first: folded, it says which lines the row takes. */
  index: number
  item: Tracked
  /** The chips under the name, already in the Chip card's words ("3 × 12", "16 kg"). */
  details?: string[]
  /** Shows an edit button (in config mode) that emits `edit`; the dialog it opens edits the
   * whole item, its goal included. */
  editable?: boolean
  /** Config mode shows the edit button after the name, and the remove button in a cell of its
   * own at the end of the row. */
  configMode: boolean
  days: Day[]
  /** Each day's mark, Monday first; `null` is an empty box. */
  marks: (Mark | null)[]
  /** How the marks are drawn: the device's mark set. The squiggles when not given. */
  markSet?: MarkSet
  /**
   * Exercises only: the days that reach the daily pick. On the grid's last row their cells draw the
   * bold pen line along the foot of the column (K35).
   */
  metDays?: boolean[]
  /** The grid's last row, which carries the met days' lines. */
  last?: boolean
}>()
const emit = defineEmits<{
  toggle: [day: number]
  remove: []
  edit: []
}>()

/** Folded, the row's name line and box line (TrackerGrid's header is line 1). */
const lines = computed(() => ({
  '--line-row': 2 + 2 * props.index,
  '--box-row': 3 + 2 * props.index,
}))

const { confirm } = useConfirm()
const row = ref<HTMLTableRowElement | null>(null)

/**
 * Where focus can go once this row is gone: the next row's Remove button, else the previous
 * row's, else the first field of the section's add form. Found before asking, while it's there.
 */
function neighbours(): HTMLElement[] {
  const tr = row.value!
  const removeIn = (el: Element | null) =>
    el?.querySelector<HTMLElement>('[data-action="remove"]') ?? null
  const form = tr.closest('section')?.querySelector<HTMLElement>('form input') ?? null
  return [removeIn(tr.nextElementSibling), removeIn(tr.previousElementSibling), form].filter(
    (el): el is HTMLElement => el !== null,
  )
}

/**
 * Removing takes the item off this week's plan only (and off the weeks that follow it without a
 * plan of their own); weeks with their own plan and the log are untouched (removeExercise,
 * removeFood). So the question says what goes and what stays, per the ConfirmDialog card.
 */
async function remove(event: MouseEvent): Promise<void> {
  // Back to this Remove button on Cancel; to a neighbour once the row has gone.
  const targets = [event.currentTarget as HTMLElement, ...neighbours()]
  // "This week" in the question is the week showing now (its Monday's key); if the week changes
  // while it is open (midnight on Sunday), Remove would take the item off another week instead.
  const week = props.days[0]!.key
  const yes = await confirm({
    title: `Remove ${props.item.name}?`,
    message:
      'It comes off this week’s plan. Weeks with their own plan keep it, and its marks stay.',
    confirmLabel: 'Remove',
    returnFocus: () => targets.find((el) => el.isConnected) ?? null,
  })
  if (yes && props.days[0]!.key === week) emit('remove')
}
</script>

<!--
  One row of the WeekGrid card: the name in body 600, then the chips, and a DayMark per day. No
  week total (K33): the goal shows only in the item's dialog. In Edit plan the edit IconButton follows
  the name (its dialog edits everything, goal included) and the remove IconButton ends the row in a
  cell of its own. The edit button's negative margin keeps the name line's height, and the header
  is at least 44px tall (an IconButton's target) in both modes, so the row keeps its height (F25).
  Those controls stay out of the Tab order until Enter (or F2) on their cell lets them in, and
  Escape leaves them (gridNav), so each grid stays one tab stop in Edit plan too.

  Folded, the name spans the seven days on the row's first line, the
  remove button over its right end in Edit plan; the days take the second line.
-->
<template>
  <tr ref="row" role="row" class="border-b border-line screen:contents" :style="lines">
    <th
      scope="row"
      role="rowheader"
      class="py-2 pr-1.5 pl-1.5 text-left align-middle font-normal focus-visible:-outline-offset-2 screen:flex screen:items-center screen:pl-0 short:py-0"
      :class="[
        CELL.rule,
        'folded:col-[1/-1] folded:row-(--line-row) folded:border-0 folded:pt-[calc(var(--n)*10)] folded:pb-0.5',
        configMode ? 'folded:pr-[15%]' : 'folded:pr-0',
      ]"
    >
      <div class="flex min-h-11 min-w-0 items-center gap-2 folded:min-h-0">
        <div
          class="flex min-w-0 flex-col gap-1.5 folded:flex-row folded:items-baseline folded:gap-2"
        >
          <span class="flex items-center gap-1">
            <span
              class="block min-w-0 text-(length:--fs-name) leading-tight font-semibold break-words text-ink"
              data-testid="item-name"
              >{{ item.name }}</span
            >
            <IconButton
              v-if="configMode && editable"
              :label="`Edit ${item.name}`"
              class="-my-2.5 shrink-0"
              data-noprint
              @click="emit('edit')"
            >
              <Pencil />
            </IconButton>
          </span>
          <span
            v-if="details?.length"
            class="flex flex-wrap items-center gap-x-2 gap-y-1 short:hidden"
          >
            <Chip
              v-for="d in details"
              :key="d"
              class="text-(length:--fs-chip)"
              data-testid="item-detail"
              >{{ d }}</Chip
            >
          </span>
        </div>
      </div>
    </th>
    <td
      v-for="(d, i) in days"
      :key="d.key"
      role="gridcell"
      class="p-0 align-middle screen:[container-type:size] folded:row-(--box-row) folded:h-(--grid-box-h)"
      :class="[CELL.rule, last && metDays?.[i] && MET_LINE]"
    >
      <DayMark
        :name="item.name"
        :date="d.full"
        :today="d.isToday"
        :mark="marks[i] ?? null"
        :set="markSet"
        fill
        @toggle="emit('toggle', i)"
      />
    </td>
    <td
      v-if="configMode"
      role="gridcell"
      class="px-1.5 text-center align-middle focus-visible:-outline-offset-2 screen:flex screen:items-center screen:justify-center folded:col-7 folded:row-(--line-row) folded:border-0 folded:p-0"
      :class="CELL.rule"
      data-noprint
    >
      <IconButton :label="`Remove ${item.name}`" data-action="remove" @click="remove">
        <Trash2 />
      </IconButton>
    </td>
  </tr>
</template>
