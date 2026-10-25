# A full-screen week

John asked for the planner to feel like the timer app: one interface with one job, readable at
arm's length. The week fills the screen, the navbar keeps out of sight until the pointer reaches
the top, and scrolling brings Food, which takes the screen in turn. An iPad and a phone on its side
should match the desktop; a phone held upright needed its own, narrower layout.

## The mockup

`brand/design-system/mockups/261025-full-screen-week` put three answers to "how is the bar reached,
and where does the title sit" on a live, clickable prototype: A, a hidden bar with a title line; B,
a hidden bar with the title in the grid's corner; C, a quiet bar that never hides. It also showed
two phone layouts: P1, the Today list grown to fill the screen, and P2, the week folded. The
prototype (`proto.js`, `proto.css`) sizes everything from its frame, so the same code drew scaled
desktops and phones on the page and a full-size `try.html`. John picked A and P2, both the
recommended options. They are K24–K26 in decisions.md §4.5.

Making the mockup showed that a portrait iPad (820px) leaves seven days beside the names about 40px
boxes. So the fold is decided by shape, not by "phone": anything held upright under 1000px wide
folds, which gives a portrait iPad boxes of about 90px.

## Building it

- **One CSS grid, two layouts, still a table.** The WeekGrid stays a `<table role="grid">`, so the
  keyboard navigation (gridNav walks `table.rows`) and the print table are unchanged. On screen
  the table is `display: grid` and its row groups and rows are `display: contents`. Folded, each
  row says which two grid lines it takes (`--line-row`, `--box-row`).
- **Variants instead of a stylesheet.** main.css defines `screen:`, `full:`, `folded:` and `short:`
  as Tailwind custom variants, and the scaled sizes as variables from one scale, `--u`. Components
  keep using utilities.
- **Edit plan and Settings opt out** (K27, a call made while building): forms don't fit a snapped
  screen, so those pages keep the sticky bar and scroll freely.
- **The Today list is gone,** with `usePhoneView`, `todaySummary` and the TodayList card. The
  PlannerScreen card replaces it in the system.

## Things that bit

- The `folded` variant written in shorthand with a comma in its media query compiled to a broken
  selector: Tailwind read the comma as a selector list. The block form with `@slot` is right.
- A `<colgroup>` inside a `display: grid` table is a grid item, and it pushed every cell along
  one column. It is `screen:hidden` now.
- Folded, the week total is placed explicitly on the name line. The name, which was only told to
  span seven columns, then couldn't fit beside it and went into new columns past the seventh. Both
  now have explicit lines.
- Rows sized `minmax(min, fixed max)` grew to their maximum because the section's height is a
  minimum, not a height. Rows are `1fr` now, and a `max-height` on the grid caps them.
- The bar must be moved out of view with a transform, never hidden with `visibility: hidden`.
  Hidden, its controls can't take focus, so `focus-within` could never bring it back.

## Rounds 2 and 3

John commented on the published mockup: remove the Picked row, drop the day of the month from the
day headers, and remove "15 of 15 this week". He then chose to remove both sections' figures, and
with them the StatFigure component and the Show weekly totals switch (K28, K29, K31, K32).

The Picked row was the only place the daily pick showed. John kept the pick, and asked for a day
that reaches it to turn green: option G2 on round 3 of the mockup, the day's name in `pen` with a
check and its column in a new `pen-wash` role (K30). The mockup's wash put the green name at
4.3:1, so it went one step lighter. Axe then caught `pen` on today's band at 4.25:1, so today's
name stays ink beside the green check.

## Round 4

John's next comments removed the Week column (K33) and added a Full screen button to the bar
(K34), both now in the app. He also asked to see A with a sidebar instead of the bar: hidden the
same way, and expanded to an icon and a name per item (Settings, Print, Log out, with room for
more). That is on the mockup as N2 beside N1, the bar, waiting for his pick.

## Round 5

John found the wash "too washed out and weak" and asked for a bold green line at the foot of the
column instead (K35). The line is 6px of `pen`, inset from the column's edges, because a full-width
line ran neighbouring met days into one bar. `pen-wash` is gone from the tokens.

## Round 6 and shipping

Today's band went too (K36), and with it the `highlight` role, its only use. John then asked to
build and push with the bar along the top (N1, K37); the sidebar stays a mockup.

## Checked

Lint, types, the unit tests, 39 e2e tests (axe on the folded week and on the bar called up, no
sideways scroll at 375px, the folded grid walked by keyboard), the design gate, and screenshots of
the real app at 1440×900, 1280×800, iPad both ways, 844×390 and 390×844/664, in both themes.
