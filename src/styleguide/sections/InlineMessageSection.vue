<script setup lang="ts">
import { InlineMessage } from '@/components/ui/inline-message'
import ExampleGroup from '../parts/ExampleGroup.vue'
import StateExample from '../parts/StateExample.vue'
</script>

<!-- The card's four tones (components/InlineMessage/preview.html), in its copy. -->
<template>
  <ExampleGroup layout="grid">
    <StateExample state="Error">
      <InlineMessage id="sg-inline-message-error" tone="error">
        Can’t reach the server. Check the connection and try again.
      </InlineMessage>
    </StateExample>
    <StateExample state="Caution: over the daily pick">
      <InlineMessage id="sg-inline-message-caution" tone="caution">
        Four exercises today, one extra.
      </InlineMessage>
    </StateExample>
    <StateExample state="Success">
      <InlineMessage id="sg-inline-message-success" tone="success">
        Added to your account. This browser’s earlier log is now part of it, on every device.
      </InlineMessage>
    </StateExample>
    <StateExample state="Info">
      <InlineMessage id="sg-inline-message-info" tone="info">
        Nothing new: everything in that file is already here.
      </InlineMessage>
    </StateExample>
  </ExampleGroup>
</template>
