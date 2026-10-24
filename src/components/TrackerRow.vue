<script setup lang="ts">
import { computed } from 'vue'
import type { Day } from '@/stores/planner'
import { MAX_TARGET, MIN_TARGET } from '@/lib/storage'
import { goalMet, type Tracked } from '@/lib/tracker'
import { useConfirm } from '@/composables/useConfirm'
import DayCell from '@/components/DayCell.vue'
import { Stepper } from '@/components/ui/stepper'

const props = defineProps<{
  item: Tracked
  /** Small chips under the name, e.g. "10 reps / set" and "12 kg". Omitted for foods. */
  details?: string[]
  /** Shows an edit button (in config mode) that emits `edit`. */
  editable?: boolean
  /** Config mode shows the edit and remove buttons and the goal stepper. */
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
const ICON_BUTTON = 'size-6 shrink-0 rounded-md text-ink-secondary hover:bg-tile hover:text-ink'

const met = computed(() => goalMet(props.total, props.item.target))

const { confirm } = useConfirm()

/**
 * Removing takes the item off this week's plan only (and off the weeks that follow it without a
 * plan of their own); weeks with their own plan and the log are untouched (removeExercise,
 * removeFood). So the question says what goes and what stays, per the ConfirmDialog card.
 */
async function remove(): Promise<void> {
  const yes = await confirm({
    title: `Remove ${props.item.name}?`,
    message:
      'It comes off this week’s plan. Weeks with their own plan keep it, and its marks stay.',
    confirmLabel: 'Remove',
  })
  if (yes) emit('remove')
}

/** The Stepper reports a new goal (only ever a changed one); the stores take a step. */
function setTarget(value: number): void {
  emit('changeTarget', value - props.item.target)
}
</script>

<template>
  <!-- display: contents keeps every cell a direct child of the parent grid. -->
  <div role="row" class="contents">
    <div
      role="rowheader"
      class="flex min-h-11 items-center gap-2 border-b border-line py-2.5 pr-2.5 pl-4"
    >
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <div class="text-sm font-semibold tracking-tight" data-testid="item-name">
          {{ item.name }}
        </div>
        <div v-if="details?.length" class="flex flex-wrap gap-1">
          <span
            v-for="d in details"
            :key="d"
            class="rounded border border-line bg-tile px-1.5 py-px text-[11px] whitespace-nowrap text-ink-secondary tabular-nums"
            data-testid="item-detail"
          >
            {{ d }}
          </span>
        </div>
      </div>
      <button
        v-if="configMode && editable"
        type="button"
        :class="ICON_BUTTON"
        title="Edit"
        :aria-label="`Edit ${item.name}`"
        data-noprint
        @click="emit('edit')"
      >
        ✎
      </button>
      <button
        v-if="configMode"
        type="button"
        :class="ICON_BUTTON"
        title="Remove"
        :aria-label="`Remove ${item.name}`"
        data-noprint
        @click="remove"
      >
        ×
      </button>
    </div>
    <DayCell
      v-for="(d, i) in days"
      :key="d.key"
      :on="flags[i] === true"
      :today="d.isToday"
      :label="`${item.name}, ${d.name} ${d.date}`"
      @toggle="emit('toggle', i)"
    />
    <div
      role="cell"
      class="flex flex-col items-center justify-center gap-1.5 border-b border-l border-b-line border-l-control-border p-2"
    >
      <div
        class="text-xl font-semibold whitespace-nowrap tabular-nums"
        :class="met ? 'text-pen' : 'text-ink'"
        :data-met="met"
        data-testid="row-total"
      >
        {{ total }}<span class="text-xs text-ink-secondary"> / {{ item.target }}</span>
      </div>
      <Stepper
        v-if="configMode"
        :model-value="item.target"
        :label="`${item.name} goal`"
        hide-label
        :lower-label="`Lower ${item.name} goal`"
        :raise-label="`Raise ${item.name} goal`"
        :min="MIN_TARGET"
        :max="MAX_TARGET"
        data-noprint
        @update:model-value="setTarget"
      />
    </div>
  </div>
</template>
