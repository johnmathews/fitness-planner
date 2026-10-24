<script setup lang="ts">
import { ChevronLeft, ChevronRight, Minus, Plus, Settings, X } from '@lucide/vue'
import { IconButton } from '@/components/ui/icon-button'
import ExampleGroup from '../parts/ExampleGroup.vue'
import StateExample from '../parts/StateExample.vue'
</script>

<!-- The card's rows (components/IconButton/preview.html), in its labels and icons. -->
<template>
  <div class="flex flex-col gap-8">
    <ExampleGroup title="Quiet">
      <StateExample state="Default">
        <IconButton id="sg-icon-button-quiet-default" label="Previous week">
          <ChevronLeft />
        </IconButton>
      </StateExample>
      <StateExample state="Focus (Tab to it)">
        <IconButton id="sg-icon-button-quiet-focus" label="Settings" aria-expanded="false">
          <Settings />
        </IconButton>
      </StateExample>
      <StateExample state="Open">
        <IconButton id="sg-icon-button-quiet-open" label="Settings" aria-expanded="true">
          <Settings />
        </IconButton>
      </StateExample>
      <StateExample state="Disabled">
        <IconButton id="sg-icon-button-quiet-disabled" label="Next week" disabled>
          <ChevronRight />
        </IconButton>
      </StateExample>
    </ExampleGroup>
    <ExampleGroup title="Outlined">
      <StateExample state="Default">
        <IconButton
          id="sg-icon-button-outlined-default"
          variant="outlined"
          label="Fewer exercises a day"
        >
          <Minus />
        </IconButton>
      </StateExample>
      <StateExample state="Focus (Tab to it)">
        <IconButton id="sg-icon-button-outlined-focus" variant="outlined" label="Close">
          <X />
        </IconButton>
      </StateExample>
      <StateExample state="Disabled">
        <IconButton
          id="sg-icon-button-outlined-disabled"
          variant="outlined"
          label="More exercises a day"
          disabled
        >
          <Plus />
        </IconButton>
      </StateExample>
    </ExampleGroup>
  </div>
</template>
