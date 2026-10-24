<!-- eslint-disable vue/multi-word-component-names -- the design system's name; it lives in components/ui/ -->
<!--
  A small quiet tag under an exercise name (brand/design-system/project/components/Chip):
  "3 × 12", "8 each side", "16 kg". Label type in ink-secondary on a tile, radius-sm, no border;
  never the pen, never clickable. On paper the fill drops and a 1px rule outlines it.
-->
<template>
  <span
    data-slot="chip"
    class="label inline-block rounded-sm bg-tile px-2 whitespace-nowrap text-ink-secondary tabular-nums print:border print:border-line"
  >
    <slot />
  </span>
</template>
