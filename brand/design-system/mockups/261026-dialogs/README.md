# Dialogs like the week

**Question:** every page is now at the week's size, but the dialogs are still the system's small
ones. How do the form dialogs (Add and Edit exercise, Add and Edit food) and the questions
(ConfirmDialog) take the week's language? What they hold, and how they behave, stay as they are.

**Status:** decided (2026-10-26)

**Link:** https://claude.ai/artifact/UEHSbSUFx9ChhuecQwPBgL (private)

The page behind is Edit plan as built (K54), drawn by `edit.js` and `edit.css` from the
261026-edit-plan mockup, with a dialog open over it. `try.html` shows it full size, with a switch
for the look, the dialog and the theme.

## Options

Both options use these sizes:

- The title is 27u. Labels and text are 19u.
- Fields, segments, the counter and buttons are 60u tall.
- Padding is 32u, with 20u between fields.
- "Times a week" moves up beside Reps count and Weight, and the Note comes last, so Add
  exercise fits a 1920×1200 screen at that size.

The options:

- **A. Centred, at the page's size.** Up to 720u wide for a form and 600u for a question.
  Recommended: the same shape as now, and what the Edit plan mockup showed.
- **B. A sheet from the right for forms.** 640u wide and the full height, with the buttons fixed
  at the foot. Questions stay centred. On a phone the sheet is the whole screen.

## Decision

John picked **A**, centred at the page's size, on 2026-10-26 (K55 in
[decisions.md](../../../../docs/decisions.md)).

## Rounds

- **1, 2026-10-26:** A and B, beside the shipped dialogs.
