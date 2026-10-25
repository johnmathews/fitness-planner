<script setup lang="ts">
import { reactive } from 'vue'
import { DayMark } from '@/components/ui/day-mark'
import { MARKS, markDrawing, markKind, type Mark } from '@/lib/storage'
import { EXERCISE_CYCLE, nextMark } from '@/lib/tracker'
import ExampleGroup from '../parts/ExampleGroup.vue'
import StateExample from '../parts/StateExample.vue'

// Each specimen steps through the marks on a press, as the card's do.
const marks = reactive<Record<string, Mark | null>>({
  empty: null,
  great: 'great',
  partial: 'partial',
  missed: 'missed',
  today: null,
  todayGreat: 'great',
  todayPartial: 'partial',
  todayMissed: 'missed',
  note: 'great',
  focus: 'great',
})
function step(key: string): void {
  marks[key] = nextMark(marks[key] ?? null, EXERCISE_CYCLE)
}
</script>

<!-- The card's states (components/DayMark/preview.html), in its copy. The band is the grid cell's,
     so the today specimens sit on a highlight cell here. The note specimen is the design only: the
     app has no notes yet (K6) and never draws an empty corner. -->
<template>
  <div class="flex flex-col gap-8">
    <ExampleGroup title="The marks, on canvas">
      <StateExample state="Empty">
        <DayMark
          id="sg-day-mark-empty"
          name="Push-ups"
          date="Tuesday 20 October"
          :mark="marks.empty!"
          @toggle="step('empty')"
        />
      </StateExample>
      <StateExample state="Great">
        <DayMark
          id="sg-day-mark-great"
          name="Push-ups"
          date="Monday 19 October"
          :mark="marks.great!"
          @toggle="step('great')"
        />
      </StateExample>
      <StateExample state="Partial">
        <DayMark
          id="sg-day-mark-partial"
          name="Push-ups"
          date="Wednesday 21 October"
          :mark="marks.partial!"
          @toggle="step('partial')"
        />
      </StateExample>
      <StateExample state="Missed">
        <DayMark
          id="sg-day-mark-missed"
          name="Push-ups"
          date="Thursday 22 October"
          :mark="marks.missed!"
          @toggle="step('missed')"
        />
      </StateExample>
    </ExampleGroup>

    <ExampleGroup title="The three drawings, as presses choose them">
      <StateExample
        v-for="mark in MARKS"
        :key="mark"
        :state="`${markKind(mark)}, ${markDrawing(mark)}`"
      >
        <DayMark name="Push-ups" date="Tuesday 20 October" :mark="mark" @toggle="() => {}" />
      </StateExample>
    </ExampleGroup>

    <ExampleGroup title="The marks, on today’s band">
      <StateExample
        v-for="[key, state] in [
          ['today', 'Today, empty'],
          ['todayGreat', 'Today, great'],
          ['todayPartial', 'Today, partial'],
          ['todayMissed', 'Today, missed'],
        ]"
        :key="key"
        :state="state!"
      >
        <div class="bg-highlight">
          <DayMark
            :id="`sg-day-mark-${key}`"
            name="Squats"
            date="Thursday 22 October"
            today
            :mark="marks[key!] ?? null"
            @toggle="step(key!)"
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
            :mark="marks.note!"
            @toggle="step('note')"
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
            :mark="marks.focus!"
            @toggle="step('focus')"
          />
        </div>
      </StateExample>
    </ExampleGroup>
  </div>
</template>
