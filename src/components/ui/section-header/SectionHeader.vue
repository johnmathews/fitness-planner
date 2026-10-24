<script setup lang="ts">
defineProps<{
  /** "Exercises", "Diet": sentence case, no icon. */
  title: string
  /** One line of plain instructions; small numbers as words. It doesn't print. */
  hint: string
  /** The h2's id, for the section's aria-labelledby. */
  headingId: string
}>()
</script>

<!--
  The heading over a WeekGrid (brand/design-system/project/components/SectionHeader): the title in
  title-1, the hint beneath in caption ink-secondary, and the section's one StatFigure (the slot)
  on the title's baseline, wrapping under the hint below 640px. On paper the heading never ends a
  page without its grid (F20) and the hint stays off the sheet (F24).
-->
<template>
  <header
    data-slot="section-header"
    class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pb-6 print:break-after-avoid print:pb-3"
  >
    <div class="flex min-w-0 flex-col gap-1">
      <h2 :id="headingId" class="title-1 text-ink">{{ title }}</h2>
      <p data-slot="section-hint" class="caption text-ink-secondary" data-noprint>{{ hint }}</p>
    </div>
    <slot />
  </header>
</template>
