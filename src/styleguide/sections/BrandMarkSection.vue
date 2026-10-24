<script setup lang="ts">
import { BrandMark } from '@/components/ui/brand-mark'
import ExampleGroup from '../parts/ExampleGroup.vue'
import StateExample from '../parts/StateExample.vue'
</script>

<!-- The card's forms (components/BrandMark/preview.html): the outlined wordmark at the Header's
     20px and the sign-in card's 32px, and the monogram for the phone Header. Ink only. -->
<template>
  <ExampleGroup>
    <StateExample state="Wordmark, 20px (Header)">
      <BrandMark id="sg-brand-mark-wordmark-md" class="max-w-full" />
    </StateExample>
    <StateExample state="Wordmark, 32px (sign-in card)">
      <BrandMark id="sg-brand-mark-wordmark-lg" size="lg" class="max-w-full" />
    </StateExample>
    <StateExample state="Monogram, 20px (phone Header)">
      <BrandMark id="sg-brand-mark-monogram-md" variant="monogram" />
    </StateExample>
  </ExampleGroup>
</template>
