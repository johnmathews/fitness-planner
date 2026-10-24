<script setup lang="ts">
import { computed, useAttrs, useId, type HTMLAttributes } from 'vue'
import { cn, joinIds } from '@/lib/utils'
import { InlineMessage } from '@/components/ui/inline-message'
import { textAreaVariants } from '.'

// Every attribute but `class` belongs to the <textarea>, not the wrapper.
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  /** Always visible. */
  label: string
  /** The textarea's id; one is generated when omitted. The hint, error and count ids derive
   * from it. */
  id?: string
  hint?: string
  /** What is wrong, then what to do. Replaces the hint and marks the textarea invalid. */
  error?: string
  /** Shows "59 of 2,000 characters" below. It does not cut text off: the consumer reports an
   * over-long value with `error`, naming the limit. */
  maxLength?: number
  /** Classes for the wrapper, for layout. */
  class?: HTMLAttributes['class']
}>()

const model = defineModel<string>()

const attrs = useAttrs()
const generatedId = useId()
const areaId = computed(() => props.id ?? generatedId)
const hintId = computed(() => `${areaId.value}-hint`)
const errorId = computed(() => `${areaId.value}-error`)
const countId = computed(() => `${areaId.value}-count`)
const showHint = computed(() => !props.error && !!props.hint)
const count = computed(() =>
  props.maxLength === undefined
    ? undefined
    : `${(model.value ?? '').length.toLocaleString('en-US')} of ${props.maxLength.toLocaleString('en-US')} characters`,
)
const describedBy = computed(() =>
  joinIds(
    attrs['aria-describedby'],
    props.error ? errorId.value : showHint.value ? hintId.value : undefined,
    count.value === undefined ? undefined : countId.value,
  ),
)
</script>

<template>
  <div
    data-slot="text-area"
    :class="cn('flex flex-col gap-1 has-disabled:opacity-40', props.class)"
  >
    <label :for="areaId" class="label text-ink">{{ label }}</label>
    <textarea
      v-bind="$attrs"
      :id="areaId"
      v-model="model"
      data-slot="text-area-input"
      :class="textAreaVariants()"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
    />
    <InlineMessage v-if="error" :id="errorId" tone="error" class="mt-1">{{ error }}</InlineMessage>
    <p v-if="showHint || count" class="caption flex justify-between gap-2 text-ink-secondary">
      <span v-if="showHint" :id="hintId">{{ hint }}</span>
      <span v-if="count" :id="countId" class="ml-auto tabular-nums">{{ count }}</span>
    </p>
  </div>
</template>
