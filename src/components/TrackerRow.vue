<script lang="ts">
/**
 * The name column, stuck to the scroller's left edge while the days scroll (WeekGrid card, phone;
 * K5, F1): on the canvas so no mark shows through, above the day cells, with a line rule on its
 * right edge on a phone. Drawn by a pseudo-element, since a collapsed table border doesn't move
 * with a sticky cell. Edit plan's name column is wider than a phone (384px), so there it scrolls
 * away with the rest instead of filling the screen.
 */
export function stickyName(configMode: boolean): string {
  return configMode
    ? ''
    : 'sticky left-0 z-10 bg-canvas max-sm:after:absolute max-sm:after:inset-y-0 max-sm:after:right-0 max-sm:after:w-px max-sm:after:bg-line'
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Pencil, Trash2 } from '@lucide/vue'
import type { Day } from '@/stores/planner'
import { goalMet, type Tracked } from '@/lib/tracker'
import { useConfirm } from '@/composables/useConfirm'
import { Chip } from '@/components/ui/chip'
import { DayMark } from '@/components/ui/day-mark'
import { IconButton } from '@/components/ui/icon-button'

const props = defineProps<{
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
  flags: boolean[]
  total: number
}>()
const emit = defineEmits<{
  toggle: [day: number]
  remove: []
  edit: []
}>()

const met = computed(() => goalMet(props.total, props.item.target))
/** The name block's width: in Edit plan an editable row's block also takes the edit button's 44px
 * and its gap beside the name (TrackerGrid widens the column to match). */
const nameWidth = computed(() =>
  props.configMode && props.editable ? 'w-44 sm:w-60' : 'w-31 sm:w-47',
)

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
  One row of the WeekGrid card: the name in body 600, then the chips; a DayMark per day; the
  week's total as "3 of 4", the only place the goal shows. In Edit plan the edit IconButton follows
  the name (its dialog edits everything, goal included) and the remove IconButton ends the row in a
  cell of its own. The edit button's negative margin keeps the name line's height, and the header
  is at least 44px tall (an IconButton's target) in both modes, so the row keeps its height (F25).
  Those controls stay out of the Tab order until Enter (or F2) on their cell lets them in, and
  Escape leaves them (gridNav), so each grid stays one tab stop in Edit plan too.
-->
<template>
  <tr ref="row" role="row" class="border-b border-line">
    <th
      scope="row"
      role="rowheader"
      class="py-2 pr-1.5 pl-1.5 text-left align-middle font-normal focus-visible:-outline-offset-2"
      :class="stickyName(configMode)"
    >
      <div class="flex min-h-11 items-center gap-2">
        <div class="flex shrink-0 flex-col" :class="nameWidth">
          <span class="flex items-center gap-1">
            <span
              class="block min-w-0 text-base font-semibold break-words text-ink"
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
          <span v-if="details?.length" class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Chip v-for="d in details" :key="d" data-testid="item-detail">{{ d }}</Chip>
          </span>
        </div>
      </div>
    </th>
    <td
      v-for="(d, i) in days"
      :key="d.key"
      role="gridcell"
      class="p-0 align-middle"
      :class="{ 'bg-highlight': d.isToday }"
    >
      <DayMark
        :name="item.name"
        :date="d.full"
        :today="d.isToday"
        :done="flags[i] === true"
        @toggle="emit('toggle', i)"
      />
    </td>
    <td role="gridcell" class="px-1 text-center align-middle focus-visible:-outline-offset-2">
      <span
        class="body-large inline-flex items-center justify-center gap-1 whitespace-nowrap"
        :data-met="met"
        data-testid="row-total"
      >
        <span class="font-semibold" :class="met ? 'text-pen' : 'text-ink'">{{ total }}</span
        >{{ ' ' }}<span class="text-ink-secondary">of {{ item.target }}</span>
        <Check
          v-if="met"
          data-slot="met-mark"
          :size="16"
          :stroke-width="1.5"
          class="shrink-0 text-pen"
        />
      </span>
    </td>
    <td
      v-if="configMode"
      role="gridcell"
      class="px-1.5 text-center align-middle focus-visible:-outline-offset-2"
      data-noprint
    >
      <IconButton :label="`Remove ${item.name}`" data-action="remove" @click="remove">
        <Trash2 />
      </IconButton>
    </td>
  </tr>
</template>
