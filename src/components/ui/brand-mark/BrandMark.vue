<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { APP_MONOGRAM, APP_NAME } from '@/lib/app'
import { cn } from '@/lib/utils'
import { brandMarkVariants, type BrandMarkVariants } from '.'
import { WORDMARK_PATH, WORDMARK_VIEWBOX } from './wordmark'

const props = withDefaults(
  defineProps<{
    /** The wordmark, or the "FP" monogram where the wordmark does not fit (the phone Header). */
    variant?: NonNullable<BrandMarkVariants['variant']>
    /** md: 20px, the Header; lg: 32px, the sign-in card. */
    size?: NonNullable<BrandMarkVariants['size']>
    class?: HTMLAttributes['class']
  }>(),
  { variant: 'wordmark', size: 'md', class: undefined },
)
</script>

<!-- Not interactive. Both forms are one image named from the app's one name string. -->
<template>
  <svg
    v-if="variant === 'wordmark'"
    data-slot="brand-mark"
    data-variant="wordmark"
    role="img"
    :aria-label="APP_NAME"
    :viewBox="WORDMARK_VIEWBOX"
    xmlns="http://www.w3.org/2000/svg"
    :class="cn(brandMarkVariants({ variant, size }), props.class)"
  >
    <path :d="WORDMARK_PATH" />
  </svg>
  <span
    v-else
    data-slot="brand-mark"
    data-variant="monogram"
    role="img"
    :aria-label="APP_NAME"
    :class="cn(brandMarkVariants({ variant, size }), props.class)"
    >{{ APP_MONOGRAM }}</span
  >
</template>
