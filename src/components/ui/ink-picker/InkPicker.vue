<script setup lang="ts">
import { useId, type HTMLAttributes } from 'vue'
import { Check } from '@lucide/vue'
import { RadioGroupItem, RadioGroupRoot } from 'reka-ui'
import { INKS, type InkId } from '@/lib/inks'
import { cn } from '@/lib/utils'
import { INK_DOT, inkOptionVariants, inkPickerVariants } from '.'

const props = defineProps<{
  /** The chosen ink. The names come from src/lib/inks.ts, so they match the card everywhere. */
  modelValue: InkId
  /** Classes for the wrapper, for layout. */
  class?: HTMLAttributes['class']
}>()

// Not defineModel: pressing the ink that is already chosen still reports it, because choosing it
// is a decision the person made (it saves the setting even when it only confirms the default).
const emit = defineEmits<{ 'update:modelValue': [id: InkId] }>()

const labelId = useId()
const hintId = useId()
</script>

<!-- A radio group: one tab stop (the chosen ink), arrow keys move and choose (Reka's roving
     focus). Every ink is always available, so there is no disabled state. -->
<template>
  <div data-slot="ink-picker" :class="cn('flex flex-col gap-1', props.class)">
    <span :id="labelId" class="label text-ink">Ink</span>
    <p :id="hintId" class="caption mb-1 text-ink-secondary">The colour of a done mark.</p>
    <RadioGroupRoot
      :model-value="modelValue"
      :aria-labelledby="labelId"
      :aria-describedby="hintId"
      :class="inkPickerVariants()"
    >
      <RadioGroupItem
        v-for="ink in INKS"
        :key="ink.id"
        :value="ink.id"
        :data-ink="ink.id"
        :class="inkOptionVariants()"
        @select="emit('update:modelValue', ink.id)"
      >
        <span
          aria-hidden="true"
          :class="
            cn(
              'size-6 flex-none rounded-full',
              'group-data-[state=checked]/ink:outline-2 group-data-[state=checked]/ink:outline-offset-2',
              'group-data-[state=checked]/ink:outline-ink group-data-[state=checked]/ink:outline-solid',
              INK_DOT[ink.id],
            )
          "
        />
        <span class="min-w-0 flex-1 whitespace-nowrap group-data-[state=checked]/ink:font-semibold">
          {{ ink.name }}
        </span>
        <Check
          :size="20"
          :stroke-width="1.5"
          class="invisible flex-none group-data-[state=checked]/ink:visible"
        />
      </RadioGroupItem>
    </RadioGroupRoot>
  </div>
</template>
