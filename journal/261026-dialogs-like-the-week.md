# Dialogs like the week

> Purpose: why the dialogs grew to the page's size, why the exercise dialog's fields moved, and
> how the change was checked.

## 1. The ask

With the week, Settings and Edit plan at the page's size, the dialogs were the last small part of
the app: 416px wide, 44px fields, a 22px title. Opening one over a big page looked out of place.
John asked for the mockup offered at the end of K54.

## 2. The decision

The mockup `brand/design-system/mockups/261026-dialogs` drew the Add exercise dialog and the
"Remove Squats?" question over Edit plan. Both options used the page's sizes. They differed in
where a form dialog sits: A centred, as now, or B as a sheet from the right. John picked A (K55).

- A form dialog is up to max(416px, 720u) wide and a question up to max(400px, 600u).
- Padding is max(24px, 32u) and the title is 27u.
- Labels and text are 19u. Fields, segments, Steppers and buttons are 60u tall, as on Settings.
- At the page's size, Add exercise was about 170px taller than a 1920×1200 screen. Times a week
  moved up beside Reps count and Weight, the Note went last, and the weight field narrowed to
  170u, so the form now fits. The food's dialog follows the same order: Name, Times a week,
  Note.

## 3. How it is built

- The panel's widths and padding live in `dialogPanelVariants`.
- The title, body and actions spacing live in `Dialog.vue` and `ConfirmDialog.vue`.
- The unlayered page-size block in `main.css` now covers `[data-slot='dialog']` and
  `[data-slot='confirm-dialog']` as well as the Settings page, through one `:is()`. It gained rules
  for TextField and TextArea: labels, inputs and hints.
- The Dialog and ConfirmDialog cards draw the new sizes at u = 1, and the system's sizes at phone
  width.

## 4. Checked

The design gate, 739 unit tests (two dialog specs updated for the new widths), lint, type-check
and the end-to-end tests passed. In the running app Add exercise is 1080px wide and fits a
1920×1200 screen without scrolling. It is 720px at 1280×800, and on a 390px phone it scrolls
inside itself. "Remove Push-ups?" is 600px at 1280×800.

## 5. Wrap-up for the day's work (K46–K55)

The `/done` wrap-up covered every change of 26 October: row names, the bar, Settings, Edit plan
and the dialogs.

- A fresh reviewer audited the docs against the shipped code and found 18 stale or missing
  claims. All are fixed:
  - the PlannerScreen card's README, and its preview, which still drew the old bar;
  - ConfirmDialog naming `WeekHeader.vue`, and Settings' "Switch" and "totals setting";
  - the `display` and `body` rows in both type tables, and the component count (31);
  - BarAction missing from the primitives table and the spec list;
  - the new `--bar-*`, `--set-*` and `--edit-ib` families and the unlayered page-size block,
    now described in architecture.md §6.1 and §6.6;
  - the IconButton, Button, SegmentedControl, Stepper, TextField, Chip and SectionHeader cards,
    which still gave fixed sizes or old examples;
  - the K52 and K48 amendment pointers to K27 and K34;
  - stale comments in SettingsPage, ExerciseGrid, DietSection, the planner store and
    exerciseForm, and the WeekGrid style guide's Switch demo, now a BarAction.
- A store test now covers `addFood` with a goal and a note. The unit suite is now 740 tests, and
  the end-to-end suite 45.
- Confirmed: the unit suite, the end-to-end suite, lint, format, type-check, the design gate and
  ruff all exited 0 locally.

## What is deliberately not done

- Edit plan's Add exercise, Add food and Copy plan buttons repeat the same four page-size
  classes, and the Settings page sizes its Buttons through the unlayered block. A `Button` size
  variant would be tidier, but it changes the Button card, so it is left for its own change.
- The Switch card and primitive stay, although no screen uses a Switch now. Removing a component
  is a sweep across tokens, gate, cards, docs and tests, and nobody asked for it.
- The PlannerScreen card's preview still holds the unused "Today" phone screen (option P1), with
  its weekly totals. The card never draws it.
- Dialogs are not a sheet (option B of K55), and the add forms are not inline (option A of K54):
  both were offered and not picked.
