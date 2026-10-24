<script setup lang="ts">
import { reactive } from 'vue'
import { DayMark } from '@/components/ui/day-mark'
import { INKS } from '@/lib/inks'
import ExampleGroup from '../parts/ExampleGroup.vue'
import StateExample from '../parts/StateExample.vue'

// Each specimen toggles, as the card's do.
const on = reactive({
  notDone: false,
  done: true,
  today: false,
  todayDone: true,
  note: true,
  focus: true,
})
const inks = reactive<Record<string, boolean>>(Object.fromEntries(INKS.map((i) => [i.id, true])))
</script>

<!-- The card's states and its four inks (components/DayMark/preview.html), in its copy. The band
     is the grid cell's, so the today specimens sit on a highlight cell here. The note specimen
     is the design only: the app has no notes yet (K6) and never draws an empty corner. -->
<template>
  <div class="flex flex-col gap-8">
    <ExampleGroup title="States, in the current ink">
      <StateExample state="Not done">
        <DayMark
          id="sg-day-mark-not-done"
          name="Push-ups"
          date="Tuesday 20 October"
          :done="on.notDone"
          @toggle="on.notDone = !on.notDone"
        />
      </StateExample>
      <StateExample state="Done">
        <DayMark
          id="sg-day-mark-done"
          name="Push-ups"
          date="Monday 19 October"
          :done="on.done"
          @toggle="on.done = !on.done"
        />
      </StateExample>
      <StateExample state="Today">
        <div class="bg-highlight">
          <DayMark
            id="sg-day-mark-today"
            name="Squats"
            date="Thursday 22 October"
            today
            :done="on.today"
            @toggle="on.today = !on.today"
          />
        </div>
      </StateExample>
      <StateExample state="Today, done">
        <div class="bg-highlight">
          <DayMark
            id="sg-day-mark-today-done"
            name="Push-ups"
            date="Thursday 22 October"
            today
            :done="on.todayDone"
            @toggle="on.todayDone = !on.todayDone"
          />
        </div>
      </StateExample>
      <StateExample state="Has a note">
        <div class="bg-highlight">
          <DayMark
            id="sg-day-mark-note"
            name="Squats"
            date="Thursday 22 October"
            today
            note
            :done="on.note"
            @toggle="on.note = !on.note"
          />
        </div>
      </StateExample>
      <StateExample state="Keyboard focus (Tab to it)">
        <div class="bg-highlight">
          <DayMark
            id="sg-day-mark-focus"
            name="Pull-ups"
            date="Thursday 22 October"
            today
            :done="on.focus"
            @toggle="on.focus = !on.focus"
          />
        </div>
      </StateExample>
    </ExampleGroup>

    <ExampleGroup title="The four inks, done, on canvas and on today’s band">
      <StateExample v-for="ink in INKS" :key="ink.id" :state="ink.name">
        <div class="flex" :style="{ '--pen': `var(--${ink.id})` }">
          <DayMark
            :id="`sg-day-mark-${ink.id}-done`"
            name="Push-ups"
            date="Wednesday 21 October"
            :done="inks[ink.id]!"
            @toggle="inks[ink.id] = !inks[ink.id]"
          />
          <div class="bg-highlight">
            <DayMark
              :id="`sg-day-mark-${ink.id}-today`"
              name="Push-ups"
              date="Thursday 22 October"
              today
              :done="inks[ink.id]!"
              @toggle="inks[ink.id] = !inks[ink.id]"
            />
          </div>
        </div>
      </StateExample>
    </ExampleGroup>
  </div>
</template>
