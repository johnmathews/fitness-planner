<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { Check, CircleAlert, Info, TriangleAlert } from '@lucide/vue'
import { cn } from '@/lib/utils'
import { inlineMessageVariants, type InlineMessageTone } from '.'

const props = defineProps<{
  /** error: something failed and needs the person; caution: over the daily pick only;
   * success: something finished they may not see otherwise; info: a neutral fact. */
  tone: InlineMessageTone
  /** Classes for the message, for layout. */
  class?: HTMLAttributes['class']
}>()

// The icon and the words carry the tone together, never the colour alone.
const ICONS = { error: CircleAlert, caution: TriangleAlert, success: Check, info: Info } as const
const icon = computed(() => ICONS[props.tone])
</script>

<!-- The words go in the slot: what happened, then what to do. Only an error interrupts
     (role="alert"); the other tones wait their turn (role="status"). -->
<template>
  <p
    data-slot="inline-message"
    :data-tone="tone"
    :role="tone === 'error' ? 'alert' : 'status'"
    :class="cn(inlineMessageVariants({ tone }), props.class)"
  >
    <component :is="icon" :size="16" :stroke-width="1.5" class="mt-0.5 shrink-0" />
    <span><slot /></span>
  </p>
</template>
