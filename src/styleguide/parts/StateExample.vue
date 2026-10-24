<script setup lang="ts">
/** One state of a component, captioned with the state's name as its card names it. */
defineProps<{ state: string }>()
</script>

<template>
  <div class="flex min-w-0 flex-col items-start gap-2">
    <p class="caption text-ink-secondary">{{ state }}</p>
    <slot />
  </div>
</template>
