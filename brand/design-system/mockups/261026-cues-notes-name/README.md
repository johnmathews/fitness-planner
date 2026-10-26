# Arrows, notes and the Tracker name

**Question:** four choices about the full-screen week. Which arrow replaces "Food ⌄" and points
back up from Food? Where does an item's markdown note sit? How does "Tracker" look as the wordmark
and the monogram? Does the new snap feel right? The grid, sizes, marks and bar stay as shipped.

**Status:** decided (2026-10-26, two rounds)

**Link:** https://claude.ai/artifact/RqqeuoLNNXCyvgSSAyzz1E (private)

The screens are live (`proto.js`, `proto.css`, from the 261025 full-screen-week prototype).
`try.html` shows them full size, with a switch for every option and the theme. `wordmarks.js`
holds the two wordmarks, outlined from Source Serif 4 600 by `wordmark.py` at -0.01em tracking.
That tracking reproduces the old wordmark's outline exactly.

## Options

### 1. The arrow between the screens

One arrow and no words, 24px in a 44px target, in `ink-secondary`. It points down at the foot of
Exercises and up at the top edge of Food. A screen reader hears "Go to Food" and "Back to
Exercises".

- **A. A bare chevron.** The old button's chevron, alone. Recommended: the most discreet.
- **B. A chevron in a ring.** An 18px chevron in a 32px `control-border` ring.
- **C. An arrow drawn by hand.** A marker arrow with a shaft, like the squiggles.

### 2. Where an item's note sits

The notes are optional markdown, cut to one line, and a press shows the whole note in a popover.
Links open in a new tab. They use the system's `note` style (Source Serif 4 italic, the person's
own words), in `ink-secondary`.

- **A. Beside the name.** On the name's line, cut at the column's edge. Recommended: the owner
  asked for it "next to the tracked item name".
- **B. Under the name.** A line of its own under the chips.
- **C. Behind an icon.** A note button after the name; nothing shows until it is pressed.

### 3. The Tracker name

- **A. "Tracker" and "T".** A capital, as before; a one-letter monogram. Recommended.
- **B. "tracker" and "tr".** All lower case, as the owner wrote it.

### 4. The snap

The sprint starts as soon as the line between two screens is 4% of the window inside it, while
the scroll is still moving. On touch it starts when the finger lifts. It takes 260 ms, eased out.
The wheel's momentum is ignored during the jump and until 180 ms of quiet after it. A tall screen
still scrolls freely. The try page has the old snap too, for comparison.

## Decision

John picked on 2026-10-26:

1. **Arrow A**, the bare chevron (K42). In the app the up arrow sits 48px from Food's top, below
   the bar's strip and touch handle, rather than on the top edge as drawn here.
2. **Notes B, changed in round 2** (K43): "bring the reps x sets text to be in line with the
   exercise name. so there are still only TWO lines of text in total (unless wrapping is
   necessary, in which case 3 rows of text is fine)".
3. **"Tracker", with no monogram** (K44): "lets not have a monogram because it serves no purpose
   and is visual clutter".
4. **The new snap** (K45): "New snap is right".

## Rounds

- **1, 2026-10-26:** the first options for all four questions. The owner picked arrow A, notes B
  with a change, "Tracker" with no monogram ("it serves no purpose and is visual clutter"), and
  the new snap ("New snap is right").
- **2, 2026-10-26:** notes B with the chips moved onto the name's line: "so there are still only
  TWO lines of text in total (unless wrapping is necessary, in which case 3 rows of text is fine)".
