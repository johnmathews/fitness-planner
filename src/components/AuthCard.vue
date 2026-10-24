<script setup lang="ts">
import { useId } from 'vue'
import { BrandMark } from '@/components/ui/brand-mark'

defineProps<{ title: string }>()

const titleId = useId()
</script>

<!-- The sign-in and link screens: one Panel on the canvas, the full width less the gutters on a
     phone, at most 384px wide. -->
<template>
  <main class="flex min-h-svh items-center justify-center px-4 py-12">
    <section
      class="w-full max-w-sm rounded-lg border border-line bg-panel p-6 shadow-overlay"
      :aria-labelledby="titleId"
    >
      <BrandMark size="lg" class="mb-6 max-w-full" />
      <h1 :id="titleId" class="title-1 mb-2 text-ink">{{ title }}</h1>
      <slot />
    </section>
  </main>
</template>
