<script setup lang="ts">
import { CircleAlert, CloudOff } from '@lucide/vue'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import StateExample from '../parts/StateExample.vue'
</script>

<!-- The card's states (components/Banner/preview.html), in its copy. In the app the banners sit in
     one aria-live region under the Header (SyncStatus.vue). -->
<template>
  <div class="flex max-w-180 flex-col gap-5">
    <StateExample state="Offline, changes waiting">
      <Banner id="sg-banner-neutral-waiting" class="w-full" :icon="CloudOff" lead="Not synced.">
        Two changes are saved on this device and will sync when you’re back online.
        <template #action><Button size="sm">Retry</Button></template>
      </Banner>
    </StateExample>
    <StateExample state="Offline, nothing waiting">
      <Banner id="sg-banner-neutral-offline" class="w-full" :icon="CloudOff" lead="Offline.">
        Showing the data saved on this device.
        <template #action><Button size="sm">Retry</Button></template>
      </Banner>
    </StateExample>
    <StateExample state="Loading, when slow (no icon)">
      <Banner id="sg-banner-neutral-loading" class="w-full">Loading your data…</Banner>
    </StateExample>
    <StateExample state="Conflict: a change was replaced">
      <Banner
        id="sg-banner-error-conflict"
        class="w-full"
        tone="error"
        :icon="CircleAlert"
        lead="Your change wasn’t kept."
      >
        A plan was changed on another device, so this device now shows that version.
        <template #action><Button variant="quiet" size="sm">Dismiss</Button></template>
      </Banner>
    </StateExample>
  </div>
</template>
