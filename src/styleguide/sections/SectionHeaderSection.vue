<script setup lang="ts">
import { SectionHeader } from '@/components/ui/section-header'
import { StatFigure } from '@/components/ui/stat-figure'
import ExampleGroup from '../parts/ExampleGroup.vue'
import StateExample from '../parts/StateExample.vue'
</script>

<!-- The card's three headers (components/SectionHeader/preview.html), in its copy. -->
<template>
  <ExampleGroup layout="grid">
    <StateExample state="Not met yet" class="w-full">
      <SectionHeader
        id="sg-section-header-unmet"
        class="w-full"
        title="Exercises"
        heading-id="sg-section-header-unmet-title"
      >
        <StatFigure :figure="10" :total="12" words="this week" :met="false" />
      </SectionHeader>
    </StateExample>
    <StateExample state="Met" class="w-full">
      <SectionHeader
        id="sg-section-header-met"
        class="w-full"
        title="Diet"
        hint="Mark each day you ate it."
        heading-id="sg-section-header-met-title"
      >
        <StatFigure :figure="4" :total="4" words="goals met" met />
      </SectionHeader>
    </StateExample>
    <StateExample state="Zero" class="w-full">
      <SectionHeader
        id="sg-section-header-zero"
        class="w-full"
        title="Exercises"
        heading-id="sg-section-header-zero-title"
      >
        <StatFigure :figure="0" :total="12" words="this week" :met="false" />
      </SectionHeader>
    </StateExample>
  </ExampleGroup>
</template>
