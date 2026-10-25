<script setup lang="ts">
import { computed, type Component } from 'vue'
import { CircleAlert, CloudOff } from '@lucide/vue'
import { CONFLICT_NOTICE, QUOTA_NOTICE, REFUSED_NOTICE, useSyncStore } from '@/stores/sync'
import { countOf } from '@/lib/words'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'

const sync = useSyncStore()

interface Words {
  lead?: string
  text: string
  icon?: Component
}

/**
 * How the data stands with the server, or null when there is nothing worth saying. Offline is
 * neutral, with the cloud-off icon; loading needs no icon (Banner card).
 */
const status = computed<Words | null>(() => {
  if (!sync.loaded) {
    return sync.status === 'offline'
      ? {
          lead: 'Can’t reach the server.',
          text: 'This device has no saved copy of your data yet.',
          icon: CloudOff,
        }
      : { text: 'Loading your data…' }
  }
  if (sync.status !== 'offline') return null
  const n = sync.pending
  return n
    ? {
        lead: 'Not synced.',
        text: `${countOf(n, 'change', true)} ${n === 1 ? 'is' : 'are'} saved on this device and will sync when you’re back online.`,
        icon: CloudOff,
      }
    : { lead: 'Offline.', text: 'Showing the data saved on this device.', icon: CloudOff }
})

/** A change the person made that was lost: the error tone, with a lead saying what happened. */
const NOTICES: Record<string, Words> = {
  [CONFLICT_NOTICE]: { lead: 'Your change wasn’t kept.', text: CONFLICT_NOTICE },
  [QUOTA_NOTICE]: {
    lead: 'Your change wasn’t saved.',
    text: 'Your account is full, so it was undone here. Ask whoever runs this planner for more room.',
  },
  [REFUSED_NOTICE]: {
    lead: 'Your change wasn’t saved.',
    text: 'The server refused it, so it was undone here. Reload to see what was saved.',
  },
}
const notice = computed(() =>
  sync.notice ? (NOTICES[sync.notice] ?? { text: sync.notice }) : null,
)
</script>

<template>
  <!-- One live region, always present, so a message appearing in it is announced. -->
  <div data-noprint aria-live="polite">
    <Banner
      v-if="status"
      class="mt-4"
      :icon="status.icon"
      :lead="status.lead"
      data-testid="sync-status"
      :data-state="sync.loaded ? sync.status : 'loading'"
    >
      {{ status.text }}
      <!-- Retry needs no busy state: the store leaves 'offline' as soon as it tries again, so
           the banner changes to loading, or goes. -->
      <template v-if="sync.status === 'offline'" #action>
        <Button size="sm" @click="sync.refresh()">Retry</Button>
      </template>
    </Banner>
    <Banner
      v-if="notice"
      tone="error"
      class="mt-4"
      :icon="CircleAlert"
      :lead="notice.lead"
      data-testid="sync-notice"
    >
      {{ notice.text }}
      <template #action>
        <Button variant="quiet" size="sm" @click="sync.dismissNotice()">Dismiss</Button>
      </template>
    </Banner>
  </div>
</template>
