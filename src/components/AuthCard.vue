<script setup lang="ts">
import { useId } from 'vue'

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
      <div class="label mb-6 flex items-center gap-2 text-ink">
        <img src="/favicon.svg" alt="" class="size-7" />
        <span>Workout Log</span>
      </div>
      <h1 :id="titleId" class="title-1 mb-2 text-ink">{{ title }}</h1>
      <slot />
    </section>
  </main>
</template>
