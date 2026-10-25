<script setup lang="ts">
import { useId, type HTMLAttributes } from 'vue'
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from 'reka-ui'
import { cn } from '@/lib/utils'
import { radioCardVariants, radioDotVariants, radioPictureVariants } from '.'

type Option = { value: string; label: string }

const props = defineProps<{
  /** The visible label above the list ("Marks"); it names the radiogroup. */
  label: string
  /** The choices, in sentence case, each short enough for one line. */
  options: Option[]
  /** Classes for the wrapper, for layout. */
  class?: HTMLAttributes['class']
}>()

const model = defineModel<string>({ required: true })

defineSlots<{
  /** What the option chooses, drawn on its row (the Marks setting: the set's three marks). */
  picture?: (props: { option: Option }) => unknown
}>()

const labelId = useId()

// Single choice that never empties: anything but one of the options' values is ignored.
function onValue(value: unknown): void {
  if (typeof value === 'string' && props.options.some((o) => o.value === value)) {
    model.value = value
  }
}
</script>

<!--
  A list of choices, exactly one chosen (brand/design-system/project/components/RadioCard): the
  label, then a bordered row per option with a radio dot, its name and its picture. Built on Reka
  UI's RadioGroup: a radiogroup labelled by the visible label, each row a role="radio" button; Tab
  reaches the chosen row and the arrow keys move between rows and choose them.
-->
<template>
  <div data-slot="radio-card" :class="cn('flex flex-col gap-2', props.class)">
    <span :id="labelId" data-slot="radio-card-label" class="label text-ink">{{ label }}</span>
    <RadioGroupRoot
      :model-value="model"
      :aria-labelledby="labelId"
      orientation="vertical"
      class="flex flex-col gap-2"
      @update:model-value="onValue"
    >
      <RadioGroupItem
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        data-slot="radio-card-option"
        :class="radioCardVariants()"
      >
        <span data-slot="radio-card-dot" aria-hidden="true" :class="radioDotVariants()">
          <RadioGroupIndicator class="size-2.5 rounded-full bg-ink" />
        </span>
        <span data-slot="radio-card-name" class="body min-w-0 flex-1">{{ option.label }}</span>
        <span
          v-if="$slots.picture"
          data-slot="radio-card-picture"
          aria-hidden="true"
          :class="radioPictureVariants()"
        >
          <slot name="picture" :option="option" />
        </span>
      </RadioGroupItem>
    </RadioGroupRoot>
  </div>
</template>
