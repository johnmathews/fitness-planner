<script setup lang="ts">
const props = defineProps<{
  value: number
  min: number
  max: number
  lowerLabel: string
  raiseLabel: string
  lowerTitle: string
  raiseTitle: string
}>()
const emit = defineEmits<{ change: [delta: number] }>()

const BUTTON =
  'h-5 w-6 text-xs text-ink-secondary hover:not-aria-disabled:bg-tile hover:not-aria-disabled:text-ink aria-disabled:cursor-default aria-disabled:opacity-40'

// aria-disabled rather than disabled: a disabled button drops focus mid-press for keyboard users.
function step(delta: number): void {
  const next = props.value + delta
  if (next >= props.min && next <= props.max) emit('change', delta)
}
</script>

<template>
  <div class="flex overflow-hidden rounded-md border border-control-border bg-panel">
    <button
      type="button"
      :class="BUTTON"
      :title="lowerTitle"
      :aria-label="lowerLabel"
      :aria-disabled="value <= min"
      @click="step(-1)"
    >
      −
    </button>
    <div class="w-px bg-line" />
    <button
      type="button"
      :class="BUTTON"
      :title="raiseTitle"
      :aria-label="raiseLabel"
      :aria-disabled="value >= max"
      @click="step(1)"
    >
      +
    </button>
  </div>
</template>
