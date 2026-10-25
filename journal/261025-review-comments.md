# Second round of review comments

Four comments on the UI review artifact, the morning after
[261024-ui-review-comments](261024-ui-review-comments.md) shipped.

## Food loses its hint

"Mark each day you ate it." under the Food heading is gone, so neither section has a hint line.

- SectionHeader keeps its optional `hint` prop. It is a small, tested part of the component, and
  the card still documents it, so a section can have a hint again without a new card.
- The SectionHeader card's Food example and the `/styleguide` copy of it drop the hint, so the card
  shows what the app shows.

## No "Optional." hints

The forms no longer say "Optional." under Sets, and the weight hint is now "Leave empty for
bodyweight." The TextField and Dialog cards changed their rule to match: fields are not marked
optional or required, and a hint says only what an empty field means.

## Exercises are edited in their dialog

The reps/seconds Stepper on each exercise row in Edit plan is gone ("use the edit modal for all
editing"). The Edit exercise dialog already had every field, the goal ("Times a week") included.
`changeAmount` and the constants only it used (`MAX_REPS`, `MIN_DURATION`, `DURATION_STEP`) are
removed. The rule in TrackerRow is that an `editable` row (one with a dialog) has no Stepper, so
foods, which have no dialog, keep their goal Stepper. Whether foods should get a dialog too is
still an open question for the user.

## Remove ends the row

The remove (bin) button moved out of the row header into a 56px column of its own after "Week",
in Edit plan only. Its header is a visually hidden "Remove", and the Picked row has an empty
`aria-hidden` cell under it. The name column now widens by the food Stepper (344px, 280px on a
phone) rather than Stepper plus two buttons. Sizing each grid for its own rows (252px for
exercises) was tried first, but then the two grids' days no longer lined up, so both use the wider
column. gridNav needed no change: the remove cell is an ordinary cell whose button is parked
until Enter or F2, and End reaches it.
