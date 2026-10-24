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
  Diet keeps "Mark each day you ate it." until the user decides on it.

The WeekGrid, Chip and SectionHeader cards in `brand/design-system/` changed first. The gate passes
with `--complete`. The Design System artifact has not been republished from them yet.

## Diet becomes Food

A third comment renamed the section. Every label a person reads now says "Food": the section
heading, the grid's table label ("Food, week of 19 October"), the Today list's group heading, and
the design-system cards and style guide that show them. Code names (`useDietStore`, `DietSection`,
`diet-heading`, the `diet` key in stored and synced data) stay as they are, so stored data, the
API and the transfer format do not change.
