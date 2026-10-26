# Bigger row names

**Question:** each line of a row's name cell goes up one size (the exercise name, the
sets-and-reps chip and the note), as the owner asked. Does the name column widen to make room?
The boxes, marks, day names and title stay as they are.

**Status:** decided (2026-10-26)

**Link:** https://claude.ai/artifact/WZf6jjFWvSHshNCJeeo6Y8 (private)

The screens are live (`proto.js`, `proto.css`, from the 261026 cues-notes-name prototype, with its
picks fixed). `try.html` shows them full size, with a switch for the size and the theme. The
exercises are the owner's, from their screenshot of 26 October. The 1920×1200 frames are u = 1.5,
the size of that screenshot.

## Options

One step on the system's type scale, on a phone and at the smallest sizes: name 18 to 20 (body to
body-large), chip 16 to 18, note 16 to 18. On a screen that scales the same: name 24u to 27u, chip
and note 17u to 19u. Folded: name 18n to 20n, chip and note 16n to 18n.

- **A. One size up, and a wider name column.** The column goes from 280u to 320u, so "Back
  extensions 12 reps a set" still fits on one line. Recommended: the row keeps its shape, just
  bigger. At 1920×1200 the boxes stay 94px, since the row height still sets them.
- **B. One size up, the column as it is.** The column stays 280u. A long name and its chip wrap
  onto two lines, and a row with a note takes three.

On a phone A and B look the same, because the name already spans the row there.

## Decision

John picked **A** on 2026-10-26, the wider name column (K46 in
[decisions.md](../../../../docs/decisions.md)). The ask was "can we make the row names sections
bigger. lets make each of the elements (exercise name, sets and reps, notes) have one-size bigger
text".

## Rounds

- **1, 2026-10-26:** A and B, beside the shipped sizes.
