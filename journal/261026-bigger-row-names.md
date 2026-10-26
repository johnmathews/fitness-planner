# Bigger row names

> Purpose: why a row's name, chips and note went up one size, and how the change was checked.

## 1. The ask

John asked for a bigger row name cell: "lets make each of the elements (exercise name, sets and
reps, notes) have one-size bigger text". One size is one step on the system's scale: the name
from `body` (18) to `body-large` (20), the chips and the note from 16 to 18. The planner's
screen sizes follow by the same factor: the name from 24u to 27u, and the chips and note from
17u to 19u. Folded, the name goes from 18n to 20n and the chips and note from 16n to 18n. On
paper they are 20px and 18px.

## 2. The decision

The mockup `brand/design-system/mockups/261026-row-name-text` asked one question: does the name
column widen with the type? At 280u, "Back extensions 12 reps a set" just fit before and wrapped
after. John picked A, a 320u column, so every line that fit before still fits (K46). The boxes
didn't shrink on John's screen: the row height, not the day's width, sets them there.

The prototype from 261026-cues-notes-name drew the mockup's screens. Its name cell kept 12px on
the right where the app keeps 6px, which made the shipped sizes wrap in the mockup. The copy now
keeps 6px, and its 1920×1200 frames match John's screenshot to the line.

## 3. Checked

The design gate, 733 unit tests, lint, type-check and 45 end-to-end tests passed. In the running
app the computed sizes match the decision: 40.5/28.5px at 1920×1200, 27/19px at 1280×800 and
20/18px on a 390px phone. No width scrolls sideways.
