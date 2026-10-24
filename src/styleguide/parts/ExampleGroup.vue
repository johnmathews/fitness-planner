<script setup lang="ts">
/**
 * A row of states for one variant ("Primary", "Outlined"), under a small heading. `grid` lays
 * wide examples (fields) out in columns that collapse to one on a phone; `row` wraps.
 */
withDefaults(defineProps<{ title?: string; layout?: 'row' | 'grid' }>(), {
  title: undefined,
  layout: 'row',
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 v-if="title" class="label text-ink-secondary">{{ title }}</h3>
    <div
      :class="
        layout === 'grid'
          ? 'grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3'
          : 'flex flex-wrap items-start gap-x-6 gap-y-5'
      "
    >
      <slot />
    </div>
  </div>
</template>
