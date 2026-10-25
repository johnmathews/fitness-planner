# Second round of review comments

Nine comments on the UI review artifact, the morning after
[261024-ui-review-comments](261024-ui-review-comments.md) shipped. All are in one PR (#20).

## Food loses its hint

"Mark each day you ate it." under the Food heading is gone, so neither section has a hint line.

- SectionHeader keeps its optional `hint` prop. It is a small, tested part of the component, and
  the card still documents it, so a section can have a hint again without a new card.
- The SectionHeader card's Food example and the `/styleguide` copy of it drop the hint, so the card
  shows what the app shows.

## No "Optional." hints, and an empty weight says "Bodyweight"

The forms no longer say "Optional." under Sets. The weight hint went next: an empty Weight in kg
now shows a grey "Bodyweight" placeholder instead of "Leave empty for bodyweight." below it, which
also ends the hint's wrap onto two lines in the dialog. The TextField and Dialog cards changed
their rule to match: fields are not marked optional or required, an empty field that means
something says so in its placeholder, and a placeholder is never an example value (the dialog's
"e.g. 12" went). A hint is still for what a label can't say ("At least 10 characters.").

## Every row is edited in its dialog

The reps/seconds Stepper on each exercise row in Edit plan is gone ("use the edit modal for all
editing"); the Edit exercise dialog already had every field, the goal ("Times a week") included.
`changeAmount` and the constants only it used (`MAX_REPS`, `MIN_DURATION`, `DURATION_STEP`) are
removed.

A later comment asked for the same on Food, so foods have an Edit food dialog now
(`EditFoodDialog.vue`: Name, then Times a week) and `updateFood` in the diet store, and their goal
Stepper is gone too. No row has a Stepper. The stores' `changeTarget` stays: the sync tests use it
as their plain plan edit.

## Remove ends the row

The remove (bin) button moved out of the row header into a 56px column of its own after "Week",
in Edit plan only. Its header is a visually hidden "Remove", and the Picked row has an empty
`aria-hidden` cell under it. gridNav needed no change: the remove cell is an ordinary cell whose
button is parked until Enter or F2, and End reaches it.

The name column now widens only by the edit button (252px, 188px on a phone). While foods still
had their Stepper, sizing each grid for its own rows put the two grids' days out of line, so both
grids use one width; that rule stays.

## The week picker is centred

The Header is a `1fr auto 1fr` grid, so the week sits at the centre whatever the sides hold. On a
phone the right-hand group is `display: contents`, so Settings stays on the first row and the Edit
switch and "This week" take the second, as before.

## Settings is a page

"Make the settings modal a settings page, then we won't feel restricted." Settings moved from the
popover to `SettingsPage.vue` at `#/settings`, with a new SettingsPage card. There is no router:
App reads the hash, as it already did for invite and reset links, which keeps the browser's Back
working and a `#/settings` address openable. Decisions:

- **The Header holds only the wordmark there.** The week navigation, Edit plan and Print are about
  the week; "Back to the week" (a TextLink) is the way back, as is the browser's Back.
- **Sections with headings:** Appearance (Theme, Ink), Planner (Exercises a day, Show weekly
  totals), Your data (with one line saying what Export and Import do), Account.
- **Focus:** arriving focuses the page's `<h1>`; going back focuses the Header's Settings button;
  a cancelled sign-out question returns to Sign out. Signing out there drops the hash, so the next
  sign-in opens on the week.
- The Popover primitive and its card stay, with no consumer for now; the card says so and keeps
  the rules for when a popover comes back. The popover-only tests (focus leaving closes it, an
  outside click) went with it.

## Day marks are boxes with a marker squiggle

"Make these small circles bigger, a box like on a whiteboard, and when filled in the mark should
be a squiggle like someone did it with a marker pen." The DayMark is now a hand-drawn box, a
little uneven, about 30px across (up from the 24px dot), in `control-border`; a done day fills it
with a `pen` squiggle drawn back and forth with round caps, 3.5 units wide. Both are SVG paths on a
36-unit square (`BOX_PATH`, `SQUIGGLE_PATH` in `day-mark/index.ts`); the card previews draw the same
paths through CSS masks, so the token colours still apply. Three squiggles were drawn and compared:
a zigzag, the back-and-forth scribble and a tick. The scribble read most like a marker filling a
box. The tick says "checked" rather than "done", and the zigzag was busier at this size.

- The squiggle appears at once; there is no draw-on animation (the card's "nothing celebrates").
- Print needs nothing new: the print rule already re-points `--pen` and `--control-border`.
- NoteMark's reason for its shape ("the only angular mark") no longer held with a box, so its card
  now says it is the only solid, filled mark in a cell. YearStrip, design-only, keeps its dots.
- The 2026-10-24 brand spec still describes dots and rings; it is the record of that decision, and
  the DayMark card is now the source for the mark.

## Shipping it

- PR #20 merged at 08:03 CET, after `main` had moved twice under it (#21–#23, the publish gate and
  email sign-up from another session). The conflicts were small: App.vue now reads `#/signup` and
  `#/settings` from the hash side by side, and the import's new full-account message landed in
  SettingsPage.vue through git's rename detection. Since #21, merging is deploying: CI on `main`
  gates the image publish, and What's Up Docker on the infra VM recreates both containers when
  `latest` changes. `87d4aef` was live and healthy at 08:06 CET.
- Two follow-ups (#24, #25) took the last "dot" and "ring" wording, and the stale Settings popover
  references, out of the design system's shared pages and `tokens.json`.
- The Design System artifact was republished from `main` (version 8). The type wants the index's
  `lastChange` set on every revision, so `design-system.json` records it here too.
