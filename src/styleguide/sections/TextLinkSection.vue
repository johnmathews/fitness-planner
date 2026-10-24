<script setup lang="ts">
import { TextLink } from '@/components/ui/text-link'
import ExampleGroup from '../parts/ExampleGroup.vue'
import StateExample from '../parts/StateExample.vue'

// The links stay on this section, so following one does not lose the place.
const HREF = '#sg-text-link'
</script>

<!-- The card's examples (components/TextLink/preview.html), in its copy. There is no disabled
     link, and visited looks the same as unvisited. -->
<template>
  <div class="flex flex-col gap-8">
    <ExampleGroup layout="grid">
      <StateExample state="In a sentence">
        <p class="body">
          This invite has already been used.
          <TextLink id="sg-text-link-body-default" :href="HREF">Go to sign in</TextLink>.
        </p>
      </StateExample>
      <StateExample state="In a caption, the link stays ink">
        <p class="caption text-ink-secondary">
          Your session has ended.
          <TextLink id="sg-text-link-caption-default" :href="HREF">Sign in again</TextLink> to keep
          syncing; changes made on this device are kept.
        </p>
      </StateExample>
    </ExampleGroup>
    <ExampleGroup>
      <StateExample state="Default">
        <TextLink id="sg-text-link-standalone-default" :href="HREF" class="body">
          Go to sign in
        </TextLink>
      </StateExample>
      <StateExample state="Focus (Tab to it)">
        <TextLink id="sg-text-link-standalone-focus" :href="HREF" class="body">
          Go to sign in
        </TextLink>
      </StateExample>
    </ExampleGroup>
  </div>
</template>
