<script setup lang="ts">
defineProps<{
  /** "Exercises", "Food": sentence case, no icon. */
  title: string
  /**
   * The week, as the Header writes it ("19–25 October"), beside the title on screen: the page's
   * h1 is visually hidden there (K25, K54). Folded, and on paper, it is left out.
   */
  week?: string
  /** One optional line of plain instructions; small numbers as words. It doesn't print. */
  hint?: string
  /** The h2's id, for the section's aria-labelledby. */
  headingId: string
}>()
</script>

<!--
  The heading over a WeekGrid (brand/design-system/project/components/SectionHeader): the title in
  title-1, the week beside it, and the optional hint beneath in caption ink-secondary. No figure:
  the sections' weekly figures were removed (K31). On paper the heading never ends a
  page without its grid (F20) and the hint stays off the sheet (F24). On the planner's screens the
  title grows with the screen and the week follows it; on a short screen the whole line moves into
  the WeekGrid's corner, so here it stays only for a screen reader.
-->
<template>
  <header
    data-slot="section-header"
    class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pb-6 print:break-after-avoid print:pb-3 screen:items-center screen:pb-[calc(var(--u)*20)] folded:pb-3 short:sr-only"
  >
    <div class="flex min-w-0 flex-col gap-1">
      <!-- The week repeats the page's h1, which a screen reader already has, so it is hidden from one. -->
      <div class="flex items-baseline gap-x-[calc(var(--u)*16)]">
        <h2
          :id="headingId"
          class="title-1 text-ink screen:text-(length:--fs-title) screen:leading-tight"
        >
          {{ title }}
        </h2>
        <span
          v-if="week"
          aria-hidden="true"
          data-slot="section-week"
          class="hidden text-(length:--fs-week) text-ink-secondary screen:inline folded:hidden"
          >{{ week }}</span
        >
      </div>
      <p v-if="hint" data-slot="section-hint" class="caption text-ink-secondary" data-noprint>
        {{ hint }}
      </p>
    </div>
    <!-- The section's actions, at the right of the title line (Edit plan's Copy plan, K54). -->
    <slot name="actions" />
  </header>
</template>
