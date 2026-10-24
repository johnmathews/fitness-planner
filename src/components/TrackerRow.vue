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
import { MAX_TARGET, MIN_TARGET } from '@/lib/storage'
import { goalMet, type Tracked } from '@/lib/tracker'
import { useConfirm } from '@/composables/useConfirm'
import { Chip } from '@/components/ui/chip'
import { DayMark } from '@/components/ui/day-mark'
import { IconButton } from '@/components/ui/icon-button'
import { Stepper } from '@/components/ui/stepper'

const props = defineProps<{
  item: Tracked
  /** The chips under the name, already in the Chip card's words ("3 × 12", "16 kg"). */
  details?: string[]
  /** Shows an edit button (in config mode) that emits `edit`. */
  editable?: boolean
  /** Config mode shows the goal Stepper and the edit and remove buttons in the row header. */
  configMode: boolean
  days: Day[]
  flags: boolean[]
  total: number
}>()
const emit = defineEmits<{
  toggle: [day: number]
  changeTarget: [delta: number]
  remove: []
  edit: []
}>()

const met = computed(() => goalMet(props.total, props.item.target))

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

/** The Stepper reports a new goal (only ever a changed one); the stores take a step. */
function setTarget(value: number): void {
  emit('changeTarget', value - props.item.target)
}
</script>

<!--
  One row of the WeekGrid card: the name in body 600, then the chips and the goal ("3 a week") in
  caption ink-secondary; a DayMark per day; the week's total as "3 of 4". In Edit plan the goal
  Stepper and the edit and remove IconButtons sit beside the name block, which keeps its width,
  and the goal caption keeps its space (invisible), so the row keeps its height (F25).
  Those controls stay out of the Tab order until Enter (or F2) on the name cell lets them in, and
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
      <div class="flex items-center gap-2">
        <div class="flex w-31 shrink-0 flex-col sm:w-47">
          <span
            class="block text-base font-semibold break-words text-ink"
            data-testid="item-name"
            >{{ item.name }}</span
          >
          <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Chip v-for="d in details" :key="d" data-testid="item-detail">{{ d }}</Chip>
            <span
              class="caption text-ink-secondary"
              :class="{ invisible: configMode }"
              data-testid="item-goal"
              >{{ item.target }} a week</span
            >
          </span>
        </div>
        <div v-if="configMode" class="flex shrink-0 items-center gap-2" data-noprint>
          <Stepper
            :model-value="item.target"
            :label="`${item.name} goal`"
            hide-label
            :lower-label="`Lower ${item.name} goal`"
            :raise-label="`Raise ${item.name} goal`"
            :min="MIN_TARGET"
            :max="MAX_TARGET"
            @update:model-value="setTarget"
          />
          <IconButton v-if="editable" :label="`Edit ${item.name}`" @click="emit('edit')">
            <Pencil />
          </IconButton>
          <IconButton :label="`Remove ${item.name}`" data-action="remove" @click="remove">
            <Trash2 />
          </IconButton>
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
  </tr>
</template>
