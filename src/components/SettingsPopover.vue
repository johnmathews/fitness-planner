<script setup lang="ts">
import { computed, nextTick, ref, useId, useTemplateRef, watch } from 'vue'
import { Download, LogOut, Settings, Upload } from '@lucide/vue'
import { usePlannerStore } from '@/stores/planner'
import { useDietStore } from '@/stores/diet'
import { useSessionStore } from '@/stores/session'
import { useSyncStore } from '@/stores/sync'
import { describeProblem } from '@/lib/problems'
import { useImportSummary } from '@/composables/importSummary'
import { MAX_DAILY_PICK, MIN_DAILY_PICK } from '@/lib/storage'
import { INKS, inkFor, type InkId } from '@/lib/inks'
import { THEMES, type Theme } from '@/lib/theme'
import { countOf } from '@/lib/words'
import { APP_NAME } from '@/lib/app'
import {
  buildExport,
  downloadExport,
  parseExport,
  type ExportData,
  type ParseError,
} from '@/lib/transfer'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { IconButton } from '@/components/ui/icon-button'
import { InkPicker } from '@/components/ui/ink-picker'
import { InlineMessage } from '@/components/ui/inline-message'
import { Popover } from '@/components/ui/popover'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Stepper } from '@/components/ui/stepper'

const THEME_NAMES: Record<Theme, string> = { system: 'System', light: 'Light', dark: 'Dark' }
const THEME_OPTIONS = THEMES.map((t) => ({ value: t, label: THEME_NAMES[t] }))

const IMPORT_ERRORS: Record<ParseError | 'read', string> = {
  json: 'That file isn’t valid JSON.',
  format: `That file isn’t a ${APP_NAME} export.`,
  version: 'That export comes from a newer version of the app.',
  read: 'That file couldn’t be read.',
}

const IMPORT_FAILED: Record<'offline' | 'server' | 'auth' | 'error', string> = {
  offline: 'Can’t reach the server, so nothing was imported. Try again when you’re online.',
  server: 'The server had a problem, so nothing was imported. Try again in a while.',
  auth: 'Your session has ended. Sign in again, then import the file.',
  error: 'The server refused the import, so nothing changed.',
}

const store = usePlannerStore()
const diet = useDietStore()
const session = useSessionStore()
const sync = useSyncStore()
const open = ref(false)
const trigger = useTemplateRef<InstanceType<typeof IconButton>>('trigger')
const dataLabelId = useId()

const fileInput = ref<HTMLInputElement | null>(null)
/** A parsed file waiting for "Import". */
const pending = ref<ExportData | null>(null)
const notice = ref<{ tone: 'error' | 'success'; text: string } | null>(null)
const signOutProblem = ref<string | null>(null)
const importing = ref(false)
const summary = useImportSummary()

// The ink the stored accent shows as (K3a): a legacy accent shows as its ink until one is chosen.
const ink = computed(() => inkFor(store.accent, store.savedSettings() !== null))
function chooseInk(id: InkId): void {
  // Choosing an ink stores its light hex, the accent's wire format.
  store.setAccent(INKS.find((i) => i.id === id)!.light)
}

const theme = computed({
  get: () => store.theme,
  set: (value: string) => store.setTheme(value as Theme),
})
const dailyPick = computed({
  get: () => store.dailyPick,
  set: (value: number) => store.changeDailyPick(value - store.dailyPick),
})

// Each opening starts clean, rather than showing the last import's or sign-out's outcome.
watch(open, () => {
  pending.value = null
  notice.value = null
  signOutProblem.value = null
})

function exportData(): void {
  downloadExport(
    buildExport({
      exercise: { plans: store.plans, log: store.log },
      diet: { plans: diet.plans, log: diet.log },
      settings: { accent: store.accent, dailyPick: store.dailyPick },
    }),
  )
}

async function onFile(ev: Event): Promise<void> {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  // Cleared so that choosing the same file again still fires `change`.
  input.value = ''
  if (!file) return
  pending.value = null
  notice.value = null
  let text: string
  try {
    text = await file.text()
  } catch {
    notice.value = { tone: 'error', text: IMPORT_ERRORS.read }
    return
  }
  const result = parseExport(text)
  if (!result.ok) {
    notice.value = { tone: 'error', text: IMPORT_ERRORS[result.error] }
    return
  }
  if (!summary.addsAnything(result.data)) {
    notice.value = {
      tone: 'success',
      text: 'Nothing new: everything in that file is already here.',
    }
    return
  }
  pending.value = result.data
}

/** Merge the file on the server (one request, never deleting), then show the result. */
async function confirmImport(data: ExportData): Promise<void> {
  if (importing.value) return
  importing.value = true
  const outcome = await sync.importFile(data)
  importing.value = false
  if (outcome.ok) {
    pending.value = null
    notice.value = { tone: 'success', text: 'Imported.' }
  } else {
    notice.value = { tone: 'error', text: IMPORT_FAILED[outcome.code] }
  }
}

// Sign out with unsynced changes asks first: signing out forgets this device's outbox, so those
// changes are lost (session.logout → sync.forget).
const askSignOut = ref(false)
const signingOut = ref(false)
const signOutError = ref<string | undefined>(undefined)
const unsynced = computed(() => {
  const n = sync.pending
  return `${countOf(n, 'change', true)} on this device ${n === 1 ? 'hasn’t' : 'haven’t'} reached the server yet. Signing out now loses them.`
})

/** The Settings button, where focus returns once the sign-out question closes. */
function settingsButton(): HTMLElement | null {
  return (trigger.value?.$el as HTMLElement | undefined) ?? null
}

async function signOut(): Promise<void> {
  if (!sync.pending) {
    const problem = await session.logout()
    signOutProblem.value = problem ? describeProblem(problem) : null
    return
  }
  // The question replaces the panel; Cancel returns focus to Settings (settingsButton) rather
  // than to a button that is no longer on the page.
  open.value = false
  await nextTick()
  signOutError.value = undefined
  askSignOut.value = true
}

async function confirmSignOut(): Promise<void> {
  if (signingOut.value) return
  signingOut.value = true
  const problem = await session.logout()
  signingOut.value = false
  if (problem) signOutError.value = describeProblem(problem)
  else askSignOut.value = false
}
</script>

<!--
  The Settings popover (brand/design-system/project/components/Popover): Theme, Ink, Exercises a
  day, then Your data and Account after rules. The panel renders in place after its trigger, so Tab
  from its last control moves on to Print, and focus leaving closes it (F14).
-->
<template>
  <div data-noprint>
    <Popover v-model:open="open" title="Settings">
      <template #trigger>
        <IconButton ref="trigger" label="Settings"><Settings /></IconButton>
      </template>
      <div class="flex flex-col gap-4">
        <SegmentedControl v-model="theme" label="Theme" :options="THEME_OPTIONS" />
        <InkPicker :model-value="ink.id" @update:model-value="chooseInk" />
        <Stepper
          v-model="dailyPick"
          label="Exercises a day"
          lower-label="Fewer exercises a day"
          raise-label="More exercises a day"
          :min="MIN_DAILY_PICK"
          :max="MAX_DAILY_PICK"
        />

        <div class="flex flex-col gap-2 border-t border-line pt-4">
          <span :id="dataLabelId" class="label text-ink">Your data</span>
          <div role="group" :aria-labelledby="dataLabelId" class="flex gap-3">
            <Button class="flex-1" @click="exportData"
              ><Download :stroke-width="1.5" />Export</Button
            >
            <Button class="flex-1" @click="fileInput?.click()"
              ><Upload :stroke-width="1.5" />Import…</Button
            >
            <input
              ref="fileInput"
              type="file"
              accept=".json,application/json"
              class="hidden"
              aria-label="Export file to import"
              data-testid="import-file"
              @change="onFile"
            />
          </div>
          <div v-if="pending" class="flex flex-col gap-2" role="group" aria-label="Confirm import">
            <p class="caption text-ink" data-testid="import-summary">
              {{ summary.describe(pending) }}
            </p>
            <div class="flex justify-end gap-3">
              <Button @click="pending = null">Cancel</Button>
              <Button variant="primary" :busy="importing" @click="confirmImport(pending)">
                Import
              </Button>
            </div>
          </div>
          <InlineMessage v-if="notice" :tone="notice.tone" data-testid="import-notice">
            {{ notice.text }}
          </InlineMessage>
        </div>

        <div class="flex flex-col gap-2 border-t border-line pt-4">
          <div class="flex items-center justify-between gap-3">
            <p class="caption min-w-0 truncate text-ink-secondary" data-testid="signed-in-as">
              Signed in as <span class="text-ink">{{ session.user }}</span>
            </p>
            <Button class="shrink-0" @click="signOut"
              ><LogOut :stroke-width="1.5" />Sign out</Button
            >
          </div>
          <InlineMessage v-if="signOutProblem" tone="error" data-testid="sign-out-problem">
            {{ signOutProblem }}
          </InlineMessage>
        </div>
      </div>
    </Popover>
    <ConfirmDialog
      v-model:open="askSignOut"
      title="Sign out now?"
      :message="unsynced"
      confirm-label="Sign out"
      :busy="signingOut"
      :error="signOutError"
      :return-focus="settingsButton"
      @confirm="confirmSignOut"
    />
  </div>
</template>
