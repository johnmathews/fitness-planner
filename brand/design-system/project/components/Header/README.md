The app bar: the wordmark on the left, the week navigation at the centre, and the settings button on the right. On the planner's screens it keeps out of sight until it is wanted.

## Out of sight (K25)

- **On the planner's screens** (PlannerScreen) the bar is hidden above the top edge and slides over the screen when it is wanted, in 160ms (none under `prefers-reduced-motion`). Shown, it keeps its `line` rule and adds `shadow-overlay`, since it lies over the week.
- **A pointer brings it** at the top edge: an invisible 14px strip along the top of the screen. It hides 500ms after the pointer leaves the bar.
- **A finger brings it** with the handle: a 40 × 5px pill in `control-border` at the top centre, in an 88 × 44px button named "Show controls". A press shows the bar, and so does pulling the handle down. A press anywhere outside the bar hides it. The handle shows wherever a coarse pointer is present (`any-pointer: coarse`), so an iPad with a trackpad has both.
- **The keyboard brings it** by focus: the bar shows while focus is inside it, so Tab from the top of the page reaches "Skip to today" and the bar's controls in view. Escape hides it.
- **Edit plan and the SettingsPage keep it in view** (K27), sticky at the top as before: the controls are the point there.

## Use

- `canvas` background with a 1px `line` rule below; no shadow, no blur. At least 56px tall; padding `space-6` at the sides on desktop, `space-4` and `space-2` on the phone.
- **Wordmark:** the BrandMark outline SVG, 20px tall, `fill: var(--ink)` so it follows the theme. Below 640px the planner's bar leaves it out (see Phone); the Settings page's bar keeps it, giving way to the "FP" monogram below 480px.
- **Layout:** three columns, `1fr auto 1fr`, so the week navigation sits at the centre of the bar whatever the two sides hold: the wordmark at the start of the first, the controls at the end of the third.
- **Week navigation:** a `nav` labelled "Week" holding two quiet IconButtons, "Previous week" (`chevron-left`) and "Next week" (`chevron-right`), around the week label ("19–25 October") in `body` size at weight 600, `tabular-nums`, with a fixed minimum width so the arrows never jump. The label is `aria-live="polite"`, so a change of week is announced.
- **This week:** a quiet Button in the right-hand controls, sm (36px) on desktop, md (44px) below 640px, shown only while another week is on screen.
- **Full screen** (K34): a quiet IconButton (`maximize`, named "Full screen"; `minimize` and "Exit full screen" while full screen) after the "Edit plan" Switch, which puts the whole page in the browser's full screen. Esc leaves it too. Where the browser has no full screen for a page, as on an iPhone, the button is left out. On a phone it sits in the second row with the Switch.
- **Settings:** a quiet IconButton (`settings`) that opens the SettingsPage. The "Edit plan" Switch, when present, sits before it on desktop. On the SettingsPage the bar holds only the wordmark.
- The bar holds no heading. The page's `<h1>` is the week date, visually hidden on the planner's screens (each SectionHeader shows the week beside its title) and set in `display` above the sections in Edit plan; the week label in the bar is plain text.
- Never `pen` in the bar. Nothing in it prints.

## States

- Buttons follow IconButton and Button: `tile` on hover and while open, a 2px `focus` outline at 2px offset.
- Phone (below 640px), on the planner (shown): the wordmark is left out, `visibility: hidden` so it keeps its grid column and the week stays at the centre. The first row is the centred arrows and label with Settings at the right; "This week" (when shown) and the "Edit plan" Switch, its visible label shortened to "Edit", take a second row, right-aligned. The week and Settings are what a phone's bar is for.
- Phone, on the SettingsPage: the bar has nothing else, so it keeps the wordmark (the monogram below 480px).
- Every target is 44px on a phone. Nothing scrolls sideways down to 320px.

## You provide

- The week label for the week on screen, and whether it is this week (to hide "This week").
- Handlers for previous, next and this week, and the way to the SettingsPage.
- The product name comes from the one place the code holds it; the bar never hard-codes it.
