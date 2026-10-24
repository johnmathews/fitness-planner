<script setup lang="ts">
import { ref, watch } from 'vue'
import { useConfirmRequest, type ConfirmOptions } from '@/composables/useConfirm'
import ConfirmDialog from './ConfirmDialog.vue'

// Mounted once by the app; shows whatever useConfirm() is asking.
const { request, answer } = useConfirmRequest()

// The words stay while the dialog closes, so it never flashes empty.
const words = ref<ConfirmOptions>({ title: '', message: '', confirmLabel: '' })
watch(request, (asked) => {
  if (asked) {
    words.value = {
      title: asked.title,
      message: asked.message,
      confirmLabel: asked.confirmLabel,
      cancelLabel: asked.cancelLabel,
      returnFocus: asked.returnFocus,
    }
  }
})
</script>

<template>
  <ConfirmDialog
    :open="request !== null"
    :title="words.title"
    :message="words.message"
    :confirm-label="words.confirmLabel"
    :cancel-label="words.cancelLabel"
    :return-focus="words.returnFocus"
    @confirm="answer(true)"
    @cancel="answer(false)"
  />
</template>
