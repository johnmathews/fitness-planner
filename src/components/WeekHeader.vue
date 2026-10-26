<script setup lang="ts">
import { usePlannerStore } from '@/stores/planner'

const store = usePlannerStore()
</script>

<!--
  The page's one h1: the week, as the Header writes it ("19–25 October"). On screen it is visually
  hidden, on the planner's screens and in Edit plan alike: each SectionHeader shows the week beside
  its title (K25, K54). On paper it is set in display above the sections.
-->
<template>
  <div class="pb-8 print:pb-0 screen:sr-only">
    <h1 class="display text-ink">{{ store.label }}</h1>
  </div>
</template>
