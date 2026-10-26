# Edit plan like the week

> Purpose: why Edit plan took the week's language, why adding moved into a dialog, and how the
> change was checked.

## 1. The ask

After the week and the Settings page, Edit plan was the last page at the system's small sizes:
a 1152px column, a display heading, small controls and a long row of add fields. John asked for
it to match "so that we have consistent design language throughout the app".

## 2. The decision

The mockup `brand/design-system/mockups/261026-edit-plan` showed one layout and asked one
question: should adding stay an inline form or become a button that opens a dialog? John picked
B, the button and dialog (K54).

- The page is full width on the 48u margins. Each section is titled like its screen, with the
  week beside the title, and the page's `<h1>` is hidden on screen.
- Rows are a fixed max(76px, 100u), since the page scrolls rather than filling the window.
- Edit and remove are max(44px, 52u) with 28u icons.
- "Copy plan to next week" is a 60u button at the right of the Exercises title line.
- "Add exercise" and "Add food" sit under their grids and open the Edit dialog with nothing to
  edit. The inline add forms are gone.

## 3. How it is built

- `EditExerciseDialog` and `EditFoodDialog` add when given no item. The title, the field ids
  (`add-…`) and the primary action ("Add exercise", "Add food") follow from that. `addFood` now
  takes a goal and a note too.
- `CopyPlan.vue` carries the copy button and the carried-over note, moved out of `WeekHeader`,
  which keeps only the `<h1>`. It is visually hidden on screen and shown on paper.
- `SectionHeader` gained an `actions` slot. Its 40u title and the week beside it now apply on
  screen, not only on the planner's screens.
- `main.css` holds `--edit-ib`, `--grid-edit-w` and `--grid-remove-w`, and it sets the screen's
  non-planner row size to 100u.
- Removing the last row now sends focus to the section's Add button.
- The dialogs keep the system's Dialog sizes. The mockup drew a larger dialog, but resizing one
  means resizing every dialog, so that is left as a question.

## 4. Checked

The design gate, the unit tests (the add tests rewritten for the dialogs), lint, type-check and
the end-to-end tests passed. In the running app the Edit plan rows are 150px at 1920×1200. The
page folds on a 390px phone, and no width scrolls sideways.
