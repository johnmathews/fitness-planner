<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import { exerciseDetails, usePlannerStore } from '@/stores/planner'
import { useDietStore } from '@/stores/diet'
import AppNavbar from '@/components/AppNavbar.vue'
import WeekHeader from '@/components/WeekHeader.vue'
import SettingsPage from '@/components/SettingsPage.vue'
import ExerciseGrid from '@/components/ExerciseGrid.vue'
import DietSection from '@/components/DietSection.vue'
import TodayList from '@/components/TodayList.vue'
import LoginForm from '@/components/LoginForm.vue'
import PasswordForm from '@/components/PasswordForm.vue'
import SignupForm from '@/components/SignupForm.vue'
import ForgotForm from '@/components/ForgotForm.vue'
import ConfirmEmail from '@/components/ConfirmEmail.vue'
import EmailStatus from '@/components/EmailStatus.vue'
import SyncStatus from '@/components/SyncStatus.vue'
import ImportPrompt from '@/components/ImportPrompt.vue'
import { ConfirmHost } from '@/components/ui/confirm-dialog'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { usePhoneView } from '@/composables/phoneView'
import { dismissConfirm } from '@/composables/useConfirm'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { isDark } from '@/lib/theme'
import { useSessionStore } from '@/stores/session'
import { useSyncStore } from '@/stores/sync'

const store = usePlannerStore()
const diet = useDietStore()
const session = useSessionStore()
const sync = useSyncStore()
// Started before the first render: a remembered user is signed in synchronously, so the app
// shows their cached data straight away instead of flashing the sign-in screen.
void session.init()

/** An invite or reset link (`#/invite/<token>`, `#/reset/<token>`): its token, else null. */
function linkToken(): string | null {
  return /^#\/(?:invite|reset)\/([A-Za-z0-9_-]+)$/.exec(location.hash)?.[1] ?? null
}
const link = ref(linkToken())
/** `#/signup`, the create-an-account form: shown only while nobody is signed in. */
function isSignup(): boolean {
  return location.hash === '#/signup'
}
const signup = ref(isSignup())
/** `#/forgot`, the ask-for-a-reset-link form: shown only while nobody is signed in. */
function isForgot(): boolean {
  return location.hash === '#/forgot'
}
const forgot = ref(isForgot())
/** A confirm-your-email link (`#/confirm/<token>`): its token, else null. Works signed in or out. */
function confirmToken(): string | null {
  return /^#\/confirm\/([A-Za-z0-9_-]+)$/.exec(location.hash)?.[1] ?? null
}
const confirmLink = ref(confirmToken())

/** The page the hash asks for: Settings at `#/settings`, otherwise the planner. */
type Page = 'planner' | 'settings'
function pageFor(): Page {
  return location.hash === '#/settings' ? 'settings' : 'planner'
}
const page = ref<Page>(pageFor())
function onHash(): void {
  link.value = linkToken()
  confirmLink.value = confirmToken()
  signup.value = isSignup()
  forgot.value = isForgot()
  page.value = pageFor()
}
// Back from Settings, focus returns to the Settings button that opened it.
watch(page, async (now) => {
  if (now !== 'planner') return
  await nextTick()
  document.querySelector<HTMLElement>('[data-testid="settings-button"]')?.focus()
})
// Signing out on the Settings page lands on the sign-in screen, and the next sign-in on the week.
watch(
  () => session.status,
  (status) => {
    if (status !== 'signed-out' || page.value !== 'settings') return
    history.replaceState(null, '', location.pathname + location.search)
    page.value = 'planner'
  },
)
/** Drop the token from the address bar and history, where a used or dead one has no place. */
function forgetToken(): void {
  history.replaceState(null, '', location.pathname + location.search)
}
function closeLink(): void {
  forgetToken()
  link.value = null
}
function closeConfirm(): void {
  forgetToken()
  confirmLink.value = null
}
function closeSignup(): void {
  history.replaceState(null, '', location.pathname + location.search)
  signup.value = false
}
function closeForgot(): void {
  history.replaceState(null, '', location.pathname + location.search)
  forgot.value = false
}
// Signed in, by this form or otherwise, the address no longer names a screen that applies.
watch(
  () => session.status === 'signed-in' && (signup.value || forgot.value),
  (stale) => {
    if (!stale) return
    if (signup.value) closeSignup()
    if (forgot.value) closeForgot()
  },
  { immediate: true },
)

// The phone opens on today (K5): the Today list below sm, with a Today | Week switch.
const { phone, view, showToday } = usePhoneView()
const VIEWS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
]
function chooseView(next: string): void {
  view.value = next === 'week' ? 'week' : 'today'
}
/** Today's column, which the Today list only ever shows (usePhoneView keeps it to this week). */
const todayIndex = computed(() => store.days.findIndex((d) => d.isToday))
const today = computed(() => {
  const i = todayIndex.value
  return {
    date: store.days[i]!.full,
    pick: store.dailyPick,
    markSet: store.markSet,
    exercises: store.exercises.map((e) => ({
      ...e,
      chips: exerciseDetails(e),
      mark: store.markOf(e.id, i),
      total: store.totalFor(e.id),
    })),
    foods: diet.foods.map((f) => ({
      ...f,
      mark: diet.markOf(f.id, i),
      total: diet.totalFor(f.id),
    })),
  }
})
/** A mark in the Today list: the same store actions the week's grids call. */
function markToday(kind: 'exercise' | 'food', id: string): void {
  if (kind === 'exercise') store.toggle(id, todayIndex.value)
  else diet.toggle(id, todayIndex.value)
}

// matchMedia is missing in some environments (jsdom), so "System" falls back to light there.
const systemDark = useMediaQuery('(prefers-color-scheme: dark)')
watchEffect(() =>
  document.documentElement.classList.toggle('dark', isDark(store.theme, systemDark.value)),
)

// An open question (useConfirm) was about the signed-in user's data. When another tab signs in as
// someone else, or out, the stores change under it, so it closes unanswered rather than letting
// its verb act on the new user's data. Synchronous, so a switch from one user straight to another
// (null for a moment between) is never missed.
watch(
  () => session.user,
  () => dismissConfirm(),
  { flush: 'sync' },
)

function onVisible(): void {
  if (document.visibilityState !== 'visible') return
  store.refreshNow()
  void sync.refresh()
}
function onFocus(): void {
  void sync.refresh()
}
function onOnline(): void {
  void sync.flush()
}
function onStorage(ev: StorageEvent): void {
  if (ev.storageArea !== localStorage) return
  void session.onStorage(ev.key)
  sync.onStorage(ev.key)
}
function onTick(): void {
  store.refreshNow()
  // Another device's changes arrive within a minute even in a tab that is never refocused.
  if (document.visibilityState === 'visible') void sync.refresh()
}

// The minute tick catches midnight in a tab that stays visible (e.g. a wall display);
// visibilitychange catches it immediately when a backgrounded tab returns.
let tick: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  document.addEventListener('visibilitychange', onVisible)
  window.addEventListener('focus', onFocus)
  window.addEventListener('online', onOnline)
  window.addEventListener('storage', onStorage)
  window.addEventListener('hashchange', onHash)
  tick = setInterval(onTick, 60_000)
})
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisible)
  window.removeEventListener('focus', onFocus)
  window.removeEventListener('online', onOnline)
  window.removeEventListener('storage', onStorage)
  window.removeEventListener('hashchange', onHash)
  clearInterval(tick)
  sync.stop()
})
</script>

<template>
  <ConfirmEmail
    v-if="confirmLink"
    :key="confirmLink"
    :token="confirmLink"
    @spent="forgetToken"
    @leave="closeConfirm"
  />
  <PasswordForm
    v-else-if="link"
    :key="link"
    :token="link"
    @done="closeLink"
    @spent="forgetToken"
    @leave="closeLink"
  />
  <template v-else-if="session.status === 'signed-in'">
    <AppNavbar :page="page" />
    <main class="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8 print:max-w-none print:p-0">
      <SyncStatus />
      <EmailStatus />
      <SettingsPage v-if="page === 'settings'" />
      <ImportPrompt v-else-if="session.user" :key="session.user" :user="session.user" />
      <template v-if="page === 'planner' && sync.loaded">
        <div v-if="phone" class="flex justify-end pt-3" data-noprint>
          <SegmentedControl
            :model-value="view"
            ariaLabel="View"
            :options="VIEWS"
            @update:model-value="chooseView"
          />
        </div>
        <TodayList v-if="showToday" v-bind="today" @toggle="markToday" />
        <template v-else>
          <WeekHeader />
          <ExerciseGrid />
          <DietSection />
        </template>
      </template>
    </main>
  </template>
  <SignupForm v-else-if="session.status === 'signed-out' && signup" @leave="closeSignup" />
  <ForgotForm v-else-if="session.status === 'signed-out' && forgot" @leave="closeForgot" />
  <LoginForm v-else-if="session.status === 'signed-out'" />
  <!-- The one host for useConfirm(): removing a row and copying over next week's plan ask here. -->
  <ConfirmHost />
</template>
