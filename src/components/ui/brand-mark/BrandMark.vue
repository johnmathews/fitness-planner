<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { APP_NAME } from '@/lib/app'
import { cn } from '@/lib/utils'
import { brandMarkVariants, type BrandMarkVariants } from '.'
import { WORDMARK_PATH, WORDMARK_VIEWBOX } from './wordmark'

const props = withDefaults(
  defineProps<{
    /** md: 20px, the Header; lg: 32px, the sign-in card. */
    size?: NonNullable<BrandMarkVariants['size']>
    class?: HTMLAttributes['class']
  }>(),
  { size: 'md', class: undefined },
)
</script>

<!-- Not interactive. One image named from the app's one name string. -->
<template>
  <svg
    data-slot="brand-mark"
    role="img"
    :aria-label="APP_NAME"
    :viewBox="WORDMARK_VIEWBOX"
    xmlns="http://www.w3.org/2000/svg"
    :class="cn(brandMarkVariants({ size }), props.class)"
  >
    <path :d="WORDMARK_PATH" />
  </svg>
</template>
