# Edit plan like the week

**Question:** the Edit plan page is still a 1152px column at the system's small sizes. Both
options give it the week's language. The one question is how a new exercise or food is added.
What the page holds, and how editing works (a dialog per item), stay as they are.

**Status:** decided (2026-10-26)

**Link:** https://claude.ai/artifact/L1BrPg8fDzzhcup3AaQiA8 (private)

The page is live (`edit.js`, `edit.css`). `marks.js` and `icons.js` hold the app's drawings and
the Lucide icons. `try.html` shows the page full size, with a switch for the layout and the
theme.

## Options

Both options:

- The page spans the width on its 48u margins, and every size comes from `u`.
- Each section has a title like its screen: "Exercises" in the 40u serif, with the week beside
  it.
- Rows use the week's sizes and are a fixed 100u tall.
- Edit and remove are 52u with 28u icons.
- "Copy plan to next week" is a 60u button on the Exercises title line.
- On a phone the week folds as on the planner.

The options:

- **A. The add form under each grid, at the page's size.** Fields 60u tall with 19u labels,
  ending in a primary "Add exercise", wrapping where the screen is too narrow. Recommended: adding
  several exercises stays one field after another.
- **B. An "Add exercise" button that opens a dialog.** One 60u button under each grid opens the
  same fields in a dialog, as editing already does.

## Decision

John picked **B**, an "Add exercise" button that opens a dialog, on 2026-10-26 (K54 in
[decisions.md](../../../../docs/decisions.md)). The ask was "lets style it consistently like we
just did with the main tracker page and the settings page so that we have consistent design
language throughout the app". As built, the dialog keeps the system's Dialog sizes rather than
the larger ones this mockup drew; that is a question for every dialog at once.

## Rounds

- **1, 2026-10-26:** A and B, beside the shipped page.
