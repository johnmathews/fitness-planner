# UI review comments: goal caption and Exercises hint

The UI was captured into a commentable artifact (https://claude.ai/artifact/2LsxoeFJA5trVnuDYZZqhX)
and reviewed there. Two comments on the desktop week view led to this change.

## Decisions

- **The goal caption under each row's name ("4 a week") is gone.** The Week total ("2 of 4")
  already states the goal, so the caption said the same thing twice. It is removed from both grids,
  because Exercises and Diet share TrackerRow and the duplication was the same in each. The goal is
  still set with the Stepper in Edit plan.
- **The row header is at least 44px tall (`min-h-11`), the Stepper's height**, to replace the old
  trick of keeping the caption's space invisible in Edit plan. Rows keep their height when Edit
  plan toggles (F25), including Diet rows, which have no chips.
- **SectionHeader's hint is optional, and Exercises has none.** "Pick three a day. Mark each one
  when it's done." is gone; the Picked row's caption ("3 a day") still states the daily pick.
  Diet kept "Mark each day you ate it." until the user removed it the next day
  ([261025-review-comments](261025-review-comments.md)).

The WeekGrid, Chip and SectionHeader cards in `brand/design-system/` changed first. The gate passes
with `--complete`. The Design System artifact has not been republished from them yet.

## Diet becomes Food

A third comment renamed the section. Every label a person reads now says "Food": the section
heading, the grid's table label ("Food, week of 19 October"), the Today list's group heading, and
the design-system cards and style guide that show them. Code names (`useDietStore`, `DietSection`,
`diet-heading`, the `diet` key in stored and synced data) stay as they are, so stored data, the
API and the transfer format do not change.

## The edit button follows the name

A fourth comment moved the pencil next to the exercise's name in Edit plan. It sits 4px after the
name with a -10px vertical margin, so the name line keeps its height while the button keeps its
44px target. The goal Stepper and the remove button stay beside the name block. An editable row's
name block widens by the button and its gap (176px, 240px from 640px up), so the column is exactly
as wide as before and the WeekGrid card's 384px and 448px still hold. Enter on a name cell now
reaches the edit button first, in reading order.

## Reps or time, the stepper edits the amount, and the totals can hide

The last round of comments:

- **The Edit plan Stepper edits the amount, not the goal.** Reps per set change far more often than
  the weekly goal. An exercise row's Stepper now edits its reps (1–999) or, for a timed exercise,
  its seconds per set (5–3600, in steps of 5). A food's Stepper still edits its goal, since a food
  has no amount. The goal moved into the Edit exercise dialog as **Times a week** (0–7).
- **An exercise counts reps or time.** `Exercise` gains an optional `duration` in whole seconds; a
  timed exercise stores `reps: 0`. The forms gain a **Measure** choice (Reps | Time) that relabels
  the amount field "Seconds" and the per-side control "Timed". Chips read "3 × 45 s",
  "1 min 30 s each side" (`durationText`). Both validators, `src/lib/storage.ts` and the API's
  `validate.py`, keep `duration` as a whole number above 0 capped at 3600, and
  `fixtures/transfer/parse/duration.json` holds them to it.
- **Show weekly totals** in Settings hides both sections' StatFigures. It is stored on the device
  with the theme (`showTotals` in `fitness-planner-settings-v1`), not synced or exported, because it
  is a display preference like the theme; so the API, sync and export formats did not change for it.
