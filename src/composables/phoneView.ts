import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usePlannerStore } from '@/stores/planner'
import { parseJson, readKey, writeKey } from '@/lib/storage'

/** The phone's two views (TodayList card): today's list, or the week's grids. */
export type View = 'today' | 'week'

/** Below Tailwind's `sm` (40rem, 640px): the phone layout, where the app opens on today (K5). */
export const PHONE_QUERY = '(width < 40rem)'

/**
 * The view last chosen on this device. Like the theme it belongs to the device, not the person
 * (decisions P3): it is never synced or exported, and signing out leaves it.
 */
export const VIEW_KEY = 'fitness-planner-view-v1'

/**
 * Which view the main screen shows (brand spec K5, TodayList card).
 *
 * - **Phone only.** Below `sm` the screen opens on the Today list, with a Today | Week switch; from
 *   `sm` up (and where `matchMedia` is missing, as in jsdom) there is only the week.
 * - **Remembered.** The switch's choice is kept on this device, so someone who prefers the week
 *   isn't sent back to today on every visit.
 * - **Today is always today.** Another week has no today, so it shows the grid; choosing Today
 *   comes back to this week. Editing the plan happens in the week, so Edit plan shows the grid and
 *   choosing Today turns Edit plan off. Neither changes the remembered choice, so leaving another
 *   week or Edit plan returns to the list.
 */
export function usePhoneView() {
  const store = usePlannerStore()

  const query = window.matchMedia?.(PHONE_QUERY)
  const phone = ref(query?.matches ?? false)
  function onChange(ev: MediaQueryListEvent): void {
    phone.value = ev.matches
  }
  onMounted(() => query?.addEventListener('change', onChange))
  onBeforeUnmount(() => query?.removeEventListener('change', onChange))

  const chosen = ref<View>(parseJson(readKey(VIEW_KEY)) === 'week' ? 'week' : 'today')
  watch(chosen, (next) => writeKey(VIEW_KEY, next))

  const showToday = computed(
    () =>
      phone.value &&
      chosen.value === 'today' &&
      store.weekKey === store.currentWeekKey &&
      !store.configMode,
  )

  /** The switch's value: what is on screen, and what the person picks. */
  const view = computed<View>({
    get: () => (showToday.value ? 'today' : 'week'),
    set: (next) => {
      chosen.value = next
      if (next === 'today') {
        store.thisWeek()
        store.setConfigMode(false)
      }
    },
  })

  return { phone, view, showToday }
}
