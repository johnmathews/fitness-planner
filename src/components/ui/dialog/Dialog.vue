<!-- eslint-disable vue/multi-word-component-names -- shadcn-vue's name; it lives in components/ui/ -->
<script setup lang="ts">
import { useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { X } from '@lucide/vue'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui'
import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui/icon-button'
import { dialogPanelVariants, scrimVariants } from '.'

const props = defineProps<{
  /** Sentence case, naming the task: "Edit exercise". Labels the dialog. */
  title: string
  /** Optional words under the title; when given, they describe the dialog. */
  description?: string
  /** Classes for the panel. */
  class?: HTMLAttributes['class']
}>()

const slots = defineSlots<{
  /** The control that opens the dialog; focus returns to it on close. */
  trigger?: () => unknown
  /** The body, usually a form's fields. */
  default?: () => unknown
  /** Secondary "Cancel" first, then the primary verb. */
  actions?: () => unknown
}>()

const open = defineModel<boolean>('open', { default: false })

const body = useTemplateRef<HTMLElement>('body')

// Opened from code rather than the trigger slot, the dialog returns focus to whatever had it.
let opener: HTMLElement = document.body
watch(open, (isOpen) => {
  if (isOpen) opener = document.activeElement as HTMLElement
})

// The card: on open, focus goes to the first field, not the Close button that comes before it.
function onOpenAutoFocus(event: Event): void {
  const first = body.value?.querySelector<HTMLElement>(
    'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
  )
  if (!first) return
  event.preventDefault()
  first.focus()
}

function onCloseAutoFocus(event: Event): void {
  if (slots.trigger) return
  event.preventDefault()
  opener.focus()
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger v-if="slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay data-slot="dialog-scrim" :class="scrimVariants()" />
      <DialogContent
        data-slot="dialog"
        aria-modal="true"
        v-bind="description ? {} : { 'aria-describedby': undefined }"
        :class="cn(dialogPanelVariants({ size: 'md' }), props.class)"
        @open-auto-focus="onOpenAutoFocus"
        @close-auto-focus="onCloseAutoFocus"
      >
        <div class="flex items-center justify-between gap-4">
          <DialogTitle as="h2" class="title-2 text-ink">{{ title }}</DialogTitle>
          <DialogClose as-child>
            <IconButton label="Close" class="-mr-2"><X /></IconButton>
          </DialogClose>
        </div>
        <div ref="body" data-slot="dialog-body" class="mt-4 flex flex-col gap-4">
          <DialogDescription v-if="description" class="body text-ink">
            {{ description }}
          </DialogDescription>
          <slot />
        </div>
        <div
          v-if="slots.actions"
          data-slot="dialog-actions"
          class="mt-6 flex flex-wrap justify-end gap-3"
        >
          <slot name="actions" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
