<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ExportData } from '@/lib/transfer'
import { usePlannerStore } from '@/stores/planner'
import { useSyncStore } from '@/stores/sync'
import { useImportSummary } from '@/composables/importSummary'
import { Button } from '@/components/ui/button'
import { InlineMessage } from '@/components/ui/inline-message'
import {
  readImportMarker,
  readLegacyData,
  writeImportMarker,
  type ImportMarker,
} from '@/lib/legacy'

/**
 * The first-login prompt: this browser holds a log from before accounts, and this user has not
 * answered for it yet. "Add to my account" merges it on the server (never deleting), "Not mine"
 * remembers the answer, and "Later" asks again on the next load.
 */
const props = defineProps<{ user: string }>()
const ADD_FAILED: Record<'offline' | 'server' | 'auth' | 'quota' | 'error', string> = {
  offline: 'Can’t reach the server, so nothing was added. Try again when you’re online.',
  server: 'The server had a problem, so nothing was added. Try again in a while.',
  auth: 'Your session has ended. Sign in again to add it.',
  quota: 'Your account is full, so nothing was added.',
  error: 'Something went wrong, so nothing was added. Try again later.',
}
const planner = usePlannerStore()
const sync = useSyncStore()
const summary = useImportSummary()

// One instance per user (App keys it on the user), so the answer is read once, on mount.
const marker = ref<ImportMarker | null>(readImportMarker(props.user))
const later = ref(false)
const busy = ref(false)
const problem = ref<string | null>(null)
const added = ref(false)

const data = computed(() =>
  // Only against the account as the server holds it: a cached copy could be stale.
  sync.fresh && !marker.value ? readLegacyData(planner.currentWeekKey) : null,
)

// Data already in the account (imported on another device, say) needs no question.
watch(
  () => (data.value ? summary.addsAnything(data.value) : true),
  (addsSomething) => {
    if (!addsSomething && !marker.value) answer('imported')
  },
  { immediate: true },
)

const show = computed(() => added.value || (!later.value && data.value !== null))

function answer(value: ImportMarker): void {
  writeImportMarker(props.user, value)
  marker.value = value
}

async function addToAccount(log: ExportData): Promise<void> {
  if (busy.value) return
  busy.value = true
  problem.value = null
  const outcome = await sync.importFile(log)
  busy.value = false
  if (outcome.ok) {
    answer('imported')
    added.value = true
  } else {
    problem.value = ADD_FAILED[outcome.code]
  }
}
</script>

<!-- A Panel (brand/design-system/project/components/Panel): it sits apart from the week, so it
     is raised; the actions follow Button order, the least first and the primary last, at the right. -->
<template>
  <section
    v-if="show"
    class="mt-4 rounded-lg border border-line bg-panel p-6 shadow-overlay"
    aria-labelledby="import-prompt-title"
    data-testid="import-prompt"
    data-noprint
  >
    <h2 id="import-prompt-title" class="title-2 text-ink">
      {{ added ? 'Added to your account' : 'Data from before accounts' }}
    </h2>
    <template v-if="added">
      <InlineMessage tone="success" class="mt-2">
        This browser’s earlier log is now part of your account, on every device.
      </InlineMessage>
      <div class="mt-4 flex justify-end">
        <Button @click="added = false">Close</Button>
      </div>
    </template>
    <template v-else-if="data">
      <p class="body mt-2 text-ink-secondary">
        This browser holds a log saved before accounts existed. If it’s yours, add it to your
        account. {{ summary.describe(data) }}
      </p>
      <InlineMessage v-if="problem" tone="error" class="mt-4">{{ problem }}</InlineMessage>
      <div class="mt-4 flex flex-wrap justify-end gap-3">
        <Button variant="quiet" @click="later = true">Later</Button>
        <Button @click="answer('dismissed')">Not mine</Button>
        <Button variant="primary" :busy="busy" @click="addToAccount(data)">
          {{ busy ? 'Adding…' : 'Add to my account' }}
        </Button>
      </div>
    </template>
  </section>
</template>
