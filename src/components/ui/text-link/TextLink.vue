<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { textLinkVariants } from '.'

const props = defineProps<{
  /** Where the link goes; the slot's words must say so ("Go to sign in"). */
  href: string
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <a data-slot="text-link" :href="href" :class="cn(textLinkVariants(), props.class)"><slot /></a>
</template>
