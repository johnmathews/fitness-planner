/**
 * A planner screen (PlannerScreen card, K24): on the planner's screens a section fills the screen,
 * and its content (the SectionHeader over the WeekGrid) sits in the middle, at the top when folded.
 * The section also carries `data-planner-screen`, which useScreenSprint finds it by (K38). Outside
 * the screens (Edit plan, print) it is an ordinary section.
 */
export const SCREEN =
  'full:flex full:min-h-dvh full:flex-col full:justify-center full:px-(--screen-pad-x) full:pt-(--screen-pad-top) full:pb-(--screen-pad-bottom) short:pt-2 short:pb-1.5 folded:justify-start'

/** The WeekGrid on a screen: it takes the height the SectionHeader leaves. */
export const SCREEN_GRID = 'full:min-h-0 full:flex-1 folded:flex-none'
