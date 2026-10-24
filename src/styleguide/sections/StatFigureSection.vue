<script setup lang="ts">
import { StatFigure } from '@/components/ui/stat-figure'
import ExampleGroup from '../parts/ExampleGroup.vue'
import StateExample from '../parts/StateExample.vue'
</script>

<!-- The card's states (components/StatFigure/preview.html). Met adds a check beside the pen, so a
     met figure never rests on colour alone (F6). -->
<template>
  <ExampleGroup layout="grid">
    <StateExample state="Met">
      <StatFigure id="sg-stat-figure-met" :figure="12" :total="12" words="this week" met />
    </StateExample>
    <StateExample state="Not met yet">
      <StatFigure
        id="sg-stat-figure-unmet"
        :figure="10"
        :total="12"
        words="this week"
        :met="false"
      />
    </StateExample>
    <StateExample state="Zero">
      <StatFigure id="sg-stat-figure-zero" :figure="0" :total="12" words="this week" :met="false" />
    </StateExample>
    <StateExample state="Diet, not met yet">
      <StatFigure id="sg-stat-figure-diet" :figure="2" :total="4" words="goals met" :met="false" />
    </StateExample>
  </ExampleGroup>
</template>
