# A met day, lighter

**Question:** a day whose marks reach its daily target shows a check after its name and a
marker stroke under its column (K30, K39). The stroke is too chunky and heavy, and the check too
slight. How much weight does a met day carry, and where? Then, how big are the day names? The grid, the marks and the green of the
day's name stay as they are.

**Status:** decided (2026-10-27)

**Link:** https://claude.ai/artifact/SdCa3XYb2MJoYkUBX3Y9qe (private)

The page is live. `met.js` draws the Exercises section in normal mode, and `met.css` sizes it
from its frame. `marks.js` holds the app's drawings, and the strokes are DayMark's
`MET_UNDERLINES`.

## Options

**1. Where a met day shows (decided: B).** Round 1 offered A, the stroke under the column at a
third of its height, and B, the day's name underlined with no stroke. John picked B, with the
underline running under the check too, and asked for bigger day names.

As built for round 2: no stroke under the column; one `pen` line, max(2px, 3u), under the day's
name and its check together; the check 1.15 times the name, with a 2.5 stroke instead of 1.5. On a
phone a column is about 51px, too narrow for both, so the check stays off there and the green
underlined name shows it alone (a screen reader still hears "daily goal met").

**2. How big the day names are (decided: 27u, without the check).** They are 20u today, 16n folded. Every day takes the
size, met or not, in both sections.

- **B24.** max(18px, 24u), 18n folded. Recommended: clearly bigger, and still a step below the
  exercise names they head.
- **B27.** max(20px, 27u), 20n folded, the rows' name size.

`pen` on the page measures 4.9:1 in light and 8.8:1 in dark.

## Decision

John picked **B** in round 1 and **27u** in round 2, on 2026-10-27 (K60 in
[decisions.md](../../../../docs/decisions.md)), and dropped the check: "27u, and lets remove the
check mark, just have the day go green and be underlined". A met day is its name in `pen`,
underlined, max(2px, 3u) thick; nothing else marks it. The day names are max(20px, 27u), 20n
folded and 20px on paper.

## Rounds

- **1, 2026-10-27:** A and B, beside the shipped look. John picked B: "lets have the green
  underline go under the tick (check) mark and the day. also lets make the day of the week text
  (and its check mark) bigger".
- **2, 2026-10-27:** B at 24u and at 27u, with the underline under the name and the check.
- **Decision, 2026-10-27:** 27u, and no check at any width.
