<!-- eslint-disable vue/multi-word-component-names -- shadcn-vue's name; it lives in components/ui/ -->
<script setup lang="ts">
import { useId, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { PopoverContent, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { cn } from '@/lib/utils'
import { popoverVariants } from '.'

const props = withDefaults(
  defineProps<{
    /** Shown in title-2 at the top of the panel and its accessible name: "Settings". */
    title: string
    /** Which edges of the trigger and panel line up; the Settings popover aligns right edges. */
    align?: 'start' | 'center' | 'end'
    /** Classes for the panel. */
    class?: HTMLAttributes['class']
  }>(),
  { align: 'end', class: undefined },
)

defineSlots<{
  /** The control that opens the popover, usually an IconButton; it gets aria-expanded. */
  trigger: () => unknown
  /** The panel's contents under the title. */
  default?: () => unknown
}>()

const open = defineModel<boolean>('open', { default: false })

const titleId = useId()
const titleEl = useTemplateRef<HTMLElement>('titleEl')

// The card: the panel is labelled by its title. Reka labels it by the trigger after any attrs, so
// re-point it once the panel (the title's parent) is in the DOM; Reka never re-sets the value.
watch(titleEl, (el) => {
  if (el) el.parentElement!.setAttribute('aria-labelledby', titleId)
})

const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]'

// F14: Reka's popover focus scope always loops, so Tab from the last control would wrap to the
// first and focus could never leave. At the panel's edges this stops the event before it reaches
// the scope: Tab from the last control then moves on to the next control on the page (and the
// focus landing outside closes the panel), and Shift+Tab from the first closes the panel, which
// returns focus to the trigger. Tab between the panel's own controls is left alone.
function onKeydownCapture(event: KeyboardEvent): void {
  if (event.key !== 'Tab') return
  const panel = event.currentTarget as HTMLElement
  const active = document.activeElement
  // A roving group's container (SegmentedControl) keeps tabindex=0 round its focused segment;
  // an ancestor of the focused control is not a stop before or after it.
  const stops = [...panel.querySelectorAll<HTMLElement>(TABBABLE)].filter(
    (el) => el.tabIndex >= 0 && (el === active || !el.contains(active)),
  )
  const edge = event.shiftKey ? stops[0] : stops.at(-1)
  if (active !== edge) return
  event.stopPropagation()
  if (event.shiftKey) {
    event.preventDefault()
    open.value = false
  }
}
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <!--
      F14: focus leaving the panel closes it. The panel renders in place, right after its trigger,
      not teleported to the end of <body>, so Tab from its last control reaches the next control on
      the page (see onKeydownCapture) and Reka's dismissable layer closes the panel on that focus
      outside. Teleported, Tab would land on Reka's focus guard at the end of <body> and focus would
      be lost when the panel closed. Escape closes it and returns focus to the trigger; a pointer
      press outside closes it where the press lands.
    -->
    <PopoverContent
      data-slot="popover-content"
      side="bottom"
      :align="align"
      :side-offset="8"
      :collision-padding="16"
      :class="cn(popoverVariants(), props.class)"
      @keydown.capture="onKeydownCapture"
    >
      <h2 :id="titleId" ref="titleEl" class="title-2 text-ink">{{ title }}</h2>
      <div class="mt-4">
        <slot />
      </div>
    </PopoverContent>
  </PopoverRoot>
</template>
