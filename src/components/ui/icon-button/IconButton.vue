<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { setLucideProps } from '@lucide/vue'
import { cn } from '@/lib/utils'
import { iconButtonVariants, type IconButtonVariants } from '.'

const props = withDefaults(
  defineProps<{
    /** The accessible name, set as aria-label: "Previous week", "Settings", "Close". Required:
     * without one the button does not render. */
    label: string
    variant?: NonNullable<IconButtonVariants['variant']>
    type?: 'button' | 'submit' | 'reset'
    class?: HTMLAttributes['class']
  }>(),
  { variant: 'quiet', type: 'button', class: undefined },
)

// The slotted Lucide icon draws at 20px with a 1.5 stroke (foundations: Icons); Lucide icons
// are aria-hidden by default, so the label is the only name.
setLucideProps({ size: 20, strokeWidth: 1.5 })
</script>

<template>
  <button
    v-if="label"
    data-slot="icon-button"
    :data-variant="variant"
    :type="type"
    :aria-label="label"
    :class="cn(iconButtonVariants({ variant }), props.class)"
  >
    <slot />
  </button>
</template>
