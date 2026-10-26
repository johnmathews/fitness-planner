<script setup lang="ts">
import { ref } from 'vue'
import { Calendar, Maximize, Pencil, Printer, Settings } from '@lucide/vue'
import { BarAction } from '@/components/ui/bar-action'
import ExampleGroup from '../parts/ExampleGroup.vue'
import StateExample from '../parts/StateExample.vue'

const editing = ref(true)
</script>

<!-- The card's rows (components/BarAction/preview.html), in its names and icons. -->
<template>
  <div class="flex flex-col gap-8">
    <ExampleGroup title="States">
      <StateExample state="Default">
        <BarAction id="sg-bar-action-default" label="Settings"><Settings /></BarAction>
      </StateExample>
      <StateExample state="Focus (Tab to it)">
        <BarAction id="sg-bar-action-focus" label="Print…"><Printer /></BarAction>
      </StateExample>
      <StateExample state="Toggle, off">
        <BarAction id="sg-bar-action-toggle-off" label="Edit plan" :pressed="false"
          ><Pencil
        /></BarAction>
      </StateExample>
      <StateExample state="Toggle, on (press it)">
        <BarAction
          id="sg-bar-action-toggle-on"
          label="Edit plan"
          :pressed="editing"
          @click="editing = !editing"
          ><Pencil
        /></BarAction>
      </StateExample>
    </ExampleGroup>
    <ExampleGroup title="At the Header’s right, another week on screen">
      <div class="flex flex-wrap gap-(--bar-gap)">
        <BarAction label="This week"><Calendar /></BarAction>
        <BarAction label="Settings"><Settings /></BarAction>
        <BarAction label="Print…"><Printer /></BarAction>
        <BarAction label="Full screen"><Maximize /></BarAction>
      </div>
    </ExampleGroup>
  </div>
</template>
