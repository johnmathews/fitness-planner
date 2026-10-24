<script setup lang="ts">
import { computed, useAttrs, useId, type HTMLAttributes } from 'vue'
import { CircleAlert } from '@lucide/vue'
import { cn, joinIds } from '@/lib/utils'
import { textFieldVariants } from '.'

// Every attribute but `class` (inputmode, autocomplete, name, type, required, data-*, …) belongs
// to the <input>, not the wrapper.
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  /** Always visible: the thing and its unit only ("Weight in kg"). */
  label: string
  /** The input's id; one is generated when omitted. The hint and error ids derive from it. */
  id?: string
  /** Below the field in ink-secondary; an optional field says so here. */
  hint?: string
  /** What happened and what to do. Replaces the hint and marks the input invalid. */
  error?: string
  /** Classes for the wrapper, for layout. */
  class?: HTMLAttributes['class']
}>()

const model = defineModel<string | number>()

const attrs = useAttrs()
const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
const hintId = computed(() => `${inputId.value}-hint`)
const errorId = computed(() => `${inputId.value}-error`)
const describedBy = computed(() =>
  joinIds(
    attrs['aria-describedby'],
    props.error ? errorId.value : props.hint ? hintId.value : undefined,
  ),
)
</script>

<template>
  <div
    data-slot="text-field"
    :class="cn('flex flex-col gap-1 has-disabled:opacity-40', props.class)"
  >
    <label :for="inputId" class="label text-ink">{{ label }}</label>
    <input
      v-bind="$attrs"
      :id="inputId"
      v-model="model"
      data-slot="text-field-input"
      :class="textFieldVariants()"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
    />
    <p
      v-if="error"
      :id="errorId"
      role="alert"
      class="caption mt-1 flex items-start gap-1 text-error-ink"
    >
      <CircleAlert :size="16" :stroke-width="1.5" class="mt-0.5 shrink-0" />
      <span>{{ error }}</span>
    </p>
    <p v-else-if="hint" :id="hintId" class="caption text-ink-secondary">{{ hint }}</p>
  </div>
</template>
