<!-- eslint-disable vue/multi-word-component-names -- the design system's name; it lives in components/ui/ -->
<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { bannerVariants, type BannerTone } from '.'

const props = withDefaults(
  defineProps<{
    /** neutral: offline or loading; error: a change the person made was lost. */
    tone?: BannerTone
    /** A Lucide icon: `CloudOff` for offline, `CircleAlert` for a lost change. Loading has none. */
    icon?: Component
    /** The short lead in weight 600 that says what happened: "Not synced.". */
    lead?: string
    class?: HTMLAttributes['class']
  }>(),
  { tone: 'neutral', icon: undefined, lead: undefined, class: undefined },
)

defineSlots<{
  /** The one sentence after the lead. */
  default: () => unknown
  /** The one action that helps (a sm Button: "Retry", "Dismiss"); it wraps below on a phone. */
  action?: () => unknown
}>()
</script>

<!-- Goes inside the page's one aria-live region (the owner keeps that region in the page), so a
     banner appearing is announced. -->
<template>
  <div data-slot="banner" :data-tone="tone" :class="cn(bannerVariants({ tone }), props.class)">
    <div class="flex min-w-0 flex-[1_1_220px] items-start gap-3 py-1">
      <component
        :is="icon"
        v-if="icon"
        data-slot="banner-icon"
        :size="20"
        :stroke-width="1.5"
        class="mt-0.5 shrink-0"
      />
      <p class="body">
        <span v-if="lead" data-slot="banner-lead" class="font-semibold">{{ lead }}</span
        >{{ lead ? ' ' : '' }}<slot />
      </p>
    </div>
    <div v-if="$slots.action" class="ml-auto flex gap-2">
      <slot name="action" />
    </div>
  </div>
</template>
