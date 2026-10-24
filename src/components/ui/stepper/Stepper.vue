<!-- eslint-disable vue/multi-word-component-names -- the design system's name; it lives in components/ui/ -->
<script setup lang="ts">
import { computed, ref, useId, type HTMLAttributes } from 'vue'
import { Minus, Plus } from '@lucide/vue'
import { NumberFieldInput, NumberFieldRoot } from 'reka-ui'
import { cn } from '@/lib/utils'
import { stepperButtonVariants, stepperValueVariants, stepperVariants } from '.'

const props = withDefaults(
  defineProps<{
    /** Visible above the control and the name of its group and spinbutton: "Exercises a day". */
    label: string
    /** The minus button's name, saying what changes: "Fewer exercises a day". */
    lowerLabel: string
    /** The plus button's name: "More exercises a day". */
    raiseLabel: string
    min: number
    max: number
    step?: number
    /** Only when the value truly cannot change; a limit is not disabled. */
    disabled?: boolean
    /** Keeps the label for screen readers only, where the row around the Stepper already says
     * what it sets (a goal in the week grid's total cell). */
    hideLabel?: boolean
    /** The spinbutton's id; one is generated when omitted. */
    id?: string
    /** Classes for the wrapper, for layout. */
    class?: HTMLAttributes['class']
  }>(),
  { step: 1, disabled: false, hideLabel: false, id: undefined, class: undefined },
)

const model = defineModel<number>({ required: true })

const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
const labelId = computed(() => `${inputId.value}-label`)

const atMin = computed(() => model.value <= props.min)
const atMax = computed(() => model.value >= props.max)

// What the live region reads out. Set only by the buttons: in the spinbutton itself a screen
// reader already speaks the new value, and a second announcement would repeat it.
const announcement = ref('')

function clamp(value: number): number {
  return Math.min(props.max, Math.max(props.min, value))
}

function stepBy(direction: 1 | -1): void {
  const next = clamp(model.value + direction * props.step)
  if (next === model.value) return
  model.value = next
  announcement.value = String(next)
}

// Reka reports an emptied or unparseable entry as NaN or undefined; the value never leaves the
// range, so keep the last good one.
function onValue(value: number | undefined): void {
  if (typeof value === 'number' && Number.isFinite(value)) model.value = value
}
</script>

<!-- The wrapper is positioned, so the visually hidden label and live region stay inside it: in a
     scrolling grid they would otherwise escape the scroll box and widen the page. -->
<template>
  <div data-slot="stepper" :class="cn('relative flex flex-col items-start gap-1', props.class)">
    <label
      :id="labelId"
      data-slot="stepper-label"
      :for="inputId"
      :class="hideLabel ? 'sr-only' : 'label text-ink'"
    >
      {{ label }}
    </label>
    <NumberFieldRoot
      :id="inputId"
      :model-value="model"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-labelledby="labelId"
      :class="stepperVariants()"
      @update:model-value="onValue"
    >
      <button
        type="button"
        data-slot="stepper-lower"
        :aria-label="lowerLabel"
        :aria-disabled="atMin ? 'true' : undefined"
        :disabled="disabled"
        :class="stepperButtonVariants()"
        @click="stepBy(-1)"
      >
        <Minus :size="20" :stroke-width="1.5" />
      </button>
      <NumberFieldInput :aria-labelledby="labelId" :class="stepperValueVariants()" />
      <button
        type="button"
        data-slot="stepper-raise"
        :aria-label="raiseLabel"
        :aria-disabled="atMax ? 'true' : undefined"
        :disabled="disabled"
        :class="stepperButtonVariants()"
        @click="stepBy(1)"
      >
        <Plus :size="20" :stroke-width="1.5" />
      </button>
    </NumberFieldRoot>
    <!-- A live region, not a field: a label would be read in place of the announcement. -->
    <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
    <output aria-live="polite" class="sr-only">{{ announcement }}</output>
  </div>
</template>
