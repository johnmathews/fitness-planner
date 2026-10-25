<script setup lang="ts">
import { ref } from 'vue'
import { Download, LogOut, Settings, Upload } from '@lucide/vue'
import { BrandMark } from '@/components/ui/brand-mark'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { InkPicker } from '@/components/ui/ink-picker'
import { Popover } from '@/components/ui/popover'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Stepper } from '@/components/ui/stepper'
import { useConfirm } from '@/composables/useConfirm'
import type { InkId } from '@/lib/inks'

const THEMES = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

const open = ref(false)
const theme = ref('system')
const pick = ref(3)
const ink = ref<InkId>('ink-blue')

const { confirm } = useConfirm()

// Sign out with unsynced changes asks first (ConfirmDialog card); StyleGuide.vue mounts the host.
async function signOut(): Promise<void> {
  await confirm({
    title: 'Sign out now?',
    message:
      "Two changes on this device haven't reached the server yet. Signing out now loses them.",
    confirmLabel: 'Sign out',
  })
}
</script>

<!-- The card's popover (components/Popover/preview.html) under its IconButton in a stand-in
     header, with the old Settings panel's contents, which SettingsPage.vue now shows as a page. The
     panel renders in place, so Tab from its last control moves on to the next section, and that
     closes it. -->
<template>
  <div
    class="flex items-center justify-between gap-4 rounded-lg border border-line bg-panel py-1 pr-1 pl-4"
  >
    <BrandMark />
    <Popover v-model:open="open" title="Settings">
      <template #trigger>
        <IconButton id="sg-popover-settings-trigger" label="Settings"><Settings /></IconButton>
      </template>
      <div class="flex flex-col gap-4">
        <SegmentedControl
          id="sg-popover-settings-theme"
          v-model="theme"
          label="Theme"
          :options="THEMES"
        />
        <InkPicker id="sg-popover-settings-ink" v-model="ink" />
        <Stepper
          id="sg-popover-settings-pick"
          v-model="pick"
          label="Exercises a day"
          lower-label="Fewer exercises a day"
          raise-label="More exercises a day"
          :min="1"
          :max="8"
        />
        <div class="flex flex-col gap-2 border-t border-line pt-4">
          <span id="sg-popover-settings-data" class="label">Your data</span>
          <div role="group" aria-labelledby="sg-popover-settings-data" class="flex gap-3">
            <Button><Download :stroke-width="1.5" />Export</Button>
            <Button><Upload :stroke-width="1.5" />Import…</Button>
          </div>
        </div>
        <div class="flex items-center justify-between gap-3 border-t border-line pt-4">
          <p class="caption text-ink-secondary">Signed in as <span class="text-ink">alex</span></p>
          <Button id="sg-popover-settings-sign-out" @click="signOut">
            <LogOut :stroke-width="1.5" />Sign out
          </Button>
        </div>
      </div>
    </Popover>
  </div>
</template>
