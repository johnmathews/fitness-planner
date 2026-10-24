import { useDietStore } from '@/stores/diet'
import { usePlannerStore } from '@/stores/planner'
import { mergeSummary, type ExportData } from '@/lib/transfer'
import { countOf } from '@/lib/words'

export type Additions = { plans: number; ticks: number; settings: boolean }

/**
 * What importing export data would add to the signed-in user's state, and that as a sentence.
 * Shared by Settings → Import… and the first-login prompt. Both read the stores each time they
 * render, so the answer stays true when another tab or a settings change gets there first.
 */
export function useImportSummary() {
  const planner = usePlannerStore()
  const diet = useDietStore()

  function additions(data: ExportData): Additions {
    const ex = mergeSummary({ plans: planner.plans, log: planner.log }, data.exercise)
    const di = mergeSummary({ plans: diet.plans, log: diet.log }, data.diet)
    // Exercise and food plans count separately: a week can gain either or both.
    return {
      plans: ex.weeks + di.weeks,
      ticks: ex.ticks + di.ticks,
      settings: data.settings !== null && planner.savedSettings() === null,
    }
  }

  function addsAnything(data: ExportData): boolean {
    const a = additions(data)
    return a.plans > 0 || a.ticks > 0 || a.settings
  }

  function describe(data: ExportData): string {
    const { plans, ticks, settings } = additions(data)
    // The settings as Settings names them: the Ink and Exercises a day (the accent is now an ink).
    const extra = settings ? ', plus the ink and the number of exercises a day' : ''
    return `Adds ${countOf(plans, 'weekly plan')} and ${countOf(ticks, 'tick')}${extra}. Existing plans and ticks stay as they are.`
  }

  return { additions, addsAnything, describe }
}
