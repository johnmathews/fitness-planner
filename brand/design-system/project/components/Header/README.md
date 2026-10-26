The app bar: the wordmark on the left, the week navigation at the centre, and the actions on the right, as big and bold as the week below it. On the planner's screens it keeps out of sight until it is wanted.

## Out of sight (K25)

- **On the planner's screens** (PlannerScreen) the bar is hidden above the top edge and slides over the screen when it is wanted, in 160ms (none under `prefers-reduced-motion`). Shown, it keeps its `line` rule and adds `shadow-overlay`, since it lies over the week.
- **A pointer brings it** at the top edge: an invisible 14px strip along the top of the screen. It hides 500ms after the pointer leaves the bar.
- **A finger brings it** with the handle: a 40 × 5px pill in `control-border` at the top centre, in an 88 × 44px button named "Show controls". A press shows the bar, and so does pulling the handle down. A press anywhere outside the bar hides it. The handle shows wherever a coarse pointer is present (`any-pointer: coarse`), so an iPad with a trackpad has both.
- **The keyboard brings it** by focus: the bar shows while focus is inside it, so Tab from the top of the page reaches "Skip to today" and the bar's controls in view. Escape hides it.
- **Edit plan keeps it in view** (K27), sticky at the top as before: the controls are the point there. The SettingsPage has no bar (K52).

## Use

- **Full width and as big as the week (K47).** The bar spans the window on the page's own margins (the PlannerScreen's 48u at the sides, 14u above and below), so the wordmark sits over the section's title and the last action over Sunday. Every size follows the screen through the PlannerScreen's `u`: about 108px tall at 1280×800 and 163px at 1920×1200. It can be that big because on the planner's screens it is out of sight until wanted.
- `canvas` background with a 1px `line` rule below; no blur.
- **Wordmark:** the BrandMark outline SVG, max(26px, 32u) tall, `fill: var(--ink)` so it follows the theme. Folded, the bar leaves it out (see Folded); there is no monogram (K44).
- **Layout:** three columns, `1fr auto 1fr`, so the week navigation sits at the centre of the bar whatever the two sides hold: the wordmark alone at the start of the first ("This week", when shown, at its end beside the week's arrows), the actions at the end of the third.
- **Week navigation:** a `nav` labelled "Week": "Previous week" (`chevron-left`) and "Next week" (`chevron-right`), each a max(28px, 32u) icon in a max(48px, 60u) quiet square, around the week label ("19–25 October") at max(20px, 26u), weight 600, `tabular-nums`, with a minimum width so the arrows never jump. The label is `aria-live="polite"`, so a change of week is announced.
- **Actions:** BarActions, a Lucide icon over its name. "This week" (`calendar`, shown only while another week is on screen) sits just left of the week's arrows, since it is a way back to this week; with it among the other actions the group grew too wide and pushed the week off centre (K50). At the right, 8u apart: "Edit plan" (`pencil`, a toggle that is filled while on; K48), "Settings" (`settings`, opens the SettingsPage), "Print…" (`printer`; left out below 640px wide) and, last, "Full screen" (K34, K49; `maximize`, or `minimize` and "Exit full screen" while full screen; left out where the browser has none, as on an iPhone). The markup follows that order, which is the tab order. The SettingsPage has no bar (K52).
- The bar holds no heading. The page's `<h1>` is the week date, visually hidden on screen (each SectionHeader shows the week beside its title; K54) and set in `display` on paper; the week label in the bar is plain text.
- Never `pen` in the bar. Nothing in it prints.

## States

- The arrows and BarActions take `tile` on hover and a 2px `focus` outline at 2px offset; Edit plan, while on, takes the `ink` fill (BarAction).
- **Folded** (held upright under 1000px wide, or any screen under 760px wide), on the planner: the wordmark is left out. The week takes the first row, centred, at 20n between 26n arrows in 48n squares; the actions share the second row equally ("This week" first when shown), each a 26n icon over its 16n name. The week moves up by CSS order, so the tab order ("This week", then the week) differs from the picture there. The week and the actions are what a phone's bar is for.
- Every target is at least 44px. Nothing scrolls sideways down to 320px.

## You provide

- The week label for the week on screen, and whether it is this week (to hide "This week").
- Handlers for previous, next and this week, and the way to the SettingsPage.
- The product name comes from the one place the code holds it; the bar never hard-codes it.
