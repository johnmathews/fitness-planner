<!-- eslint-disable vue/multi-word-component-names -- shadcn-vue's name; it lives in components/ui/ -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { buttonVariants, type ButtonVariants } from '.'

const props = withDefaults(
  defineProps<{
    variant?: NonNullable<ButtonVariants['variant']>
    size?: NonNullable<ButtonVariants['size']>
    /** `button` unless it submits a form. */
    type?: 'button' | 'submit' | 'reset'
    /** The action is in progress: sets aria-busy and keeps full colour. Pass the busy label
     * ("Signing in…") as the slot; the button does not swap or hide its words. */
    busy?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { variant: 'secondary', size: 'md', type: 'button', busy: false, class: undefined },
)
</script>

<template>
  <button
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :type="type"
    :aria-busy="busy ? 'true' : undefined"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </button>
</template>
