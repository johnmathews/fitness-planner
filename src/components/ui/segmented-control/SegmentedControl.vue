<script setup lang="ts">
import { useId, type HTMLAttributes } from 'vue'
import { ToggleGroupItem, ToggleGroupRoot } from 'reka-ui'
import { cn } from '@/lib/utils'
import { segmentedControlVariants, segmentVariants } from '.'

/** A visible label ("Theme"), or, when the segment words name the choice themselves
 * (Today | Week), an aria-label ("View") instead. One of the two is required. */
type Naming = { label: string; ariaLabel?: undefined } | { ariaLabel: string; label?: undefined }

const props = defineProps<
  Naming & {
    /** Two or three short options, in sentence case. */
    options: { value: string; label: string }[]
    /** Only when the setting cannot change. */
    disabled?: boolean
    /** Classes for the wrapper, for layout. */
    class?: HTMLAttributes['class']
  }
>()

const model = defineModel<string>({ required: true })

const labelId = useId()

if (!props.label && !props.ariaLabel) {
  console.warn('[SegmentedControl] needs a label or an ariaLabel; rendering nothing.')
}

// Single choice that never empties: Reka reports pressing the chosen segment as no value, which
// is ignored, so the pressed segment stays pressed.
function onValue(value: unknown): void {
  if (typeof value === 'string' && value !== '') model.value = value
}
</script>

<template>
  <div
    v-if="label || ariaLabel"
    data-slot="segmented-control"
    :class="cn('flex max-w-full flex-col items-start gap-1', props.class)"
  >
    <span v-if="label" :id="labelId" data-slot="segmented-control-label" class="label text-ink">
      {{ label }}
    </span>
    <ToggleGroupRoot
      type="single"
      :model-value="model"
      :disabled="disabled"
      :aria-labelledby="label ? labelId : undefined"
      :aria-label="label ? undefined : ariaLabel"
      :aria-disabled="disabled ? 'true' : undefined"
      :class="segmentedControlVariants()"
      @update:model-value="onValue"
    >
      <ToggleGroupItem
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :class="segmentVariants()"
      >
        {{ option.label }}
      </ToggleGroupItem>
    </ToggleGroupRoot>
  </div>
</template>
