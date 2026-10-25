# A full-screen week

**Question:** the planner becomes one full-screen interface, like the timer app. The week fills the
screen, Exercises and Food get a screen each, and the scroll snaps between them. How is the bar
reached, and where does each screen's title sit? What does a phone held upright show? The marks,
pens, totals, the Picked row and the bar's contents stay as they are.

**Status:** decided (2026-10-25, six rounds)

**Link:** https://claude.ai/artifact/38yFBRUMC8sJrCNjZcmGpg (private)

## Shared by every option

- Exercises is one screen and Food is the next (`scroll-snap-type: y mandatory`).
- Sizes come from the screen (`--candidate-u`, 1 at 1280×800, 0.75 to 1.6). At 1280×800 the names
  are 24px and the boxes 86px. No type is below the system's 16px.
- A day box is 86% of its cell's shorter side, up to 128px. A tall screen caps the rows at 1.25 ×
  a day's width and centres the week. More rows than fit stop at 56px, and the screen runs longer.
- A desktop, an iPad on its side and a phone on its side get the same screen. On a short screen
  (540px or less) the title goes into the grid's corner and the chips and hint lines drop out.
- An iPad held upright folds the week as P2 does, scaled up (`--candidate-n`, up to 1.4).
- The pointer brings the bar from a 14px strip along the top edge. A touch screen brings it with a
  handle at the top centre, pressed or pulled. Focus inside the bar shows it. Escape, the pointer
  leaving or a press elsewhere hides it.

## Options

### 1. The bar and the titles

- **A. Hidden bar, a title line:** each screen opens with its name (serif, 40px at u = 1) and the
  week, its figure at the right. A "Food" button with an arrow sits at the foot of the first screen.
  Recommended: the SectionHeader card stays as it is, and the arrow says there is more.
- **B. Hidden bar, the title in the corner:** the name, week and figure sit in the grid's empty
  top-left cell, giving the rows the title line's height. Two marks at the right edge show which
  screen is in view.
- **C. A quiet bar that stays:** the timer's way. The bar never hides. It loses its wordmark, rule
  and shadow, and its tools turn `ink-secondary`. Titles as in A, without the week.

### 2. A phone held upright

- **P2. The week, narrow:** each row's name, first chip and total on one line, its seven boxes
  beneath, today's band unbroken down the last column. Nothing scrolls sideways. The phone opens
  on the week, which changes K5. Recommended: one interface everywhere.
- **P1. Today, full screen:** the phone keeps opening on today (K5). The Today list fills the
  screen, marks up to 96px, Food on the next screen. Today | Week in the bar, the week as P2.

## Decision

John picked **A** (hidden bar, a title line) and **P2** (the week, narrow) on 2026-10-25, both
the recommended options. Recorded as K24 to K26 in `docs/decisions.md` §4.5, with K27 (Edit plan
and Settings keep the bar and scroll freely) as a call made while building. Round 2 removed the
Picked row and the day-of-month numbers (K28, K29). Round 3 removed both section figures and the
Show weekly totals switch (K31, K32), and John picked **G2** for a day that meets the daily pick
(K30), later a bold green line at the foot of the column instead of a wash (K35). Round 4 removed the
Week column and added a Full screen button (K33, K34); John went ahead with the bar (N1, K37).
Round 6 removed today's band (K36).

## Rounds

- **1, 2026-10-25:** A, B and C on a 1440×900 desktop; A on an iPad both ways and a phone on its
  side; P1 and P2 on a 390×844 iPhone. Every screen is live (`proto.js`, `proto.css`), and
  `try.html` shows one at full size on a real device.
- **2, 2026-10-25:** from John's comments on the page: "lets remove this row completely" (the
  Picked row) and "lets remove the day-of-the-month number and just keep the day name
  abreviation". Both go from every option and screen; the date stays for a screen reader.
- **3, 2026-10-25:** John: remove both section figures ("15 of 15 this week", "0 of 4 goals met"),
  and keep the daily pick: "when the user achieves their exercises per day goal, there should be
  some visual affirmation - such as the column or text going green". Options: G1, the day's name in
  `pen` with a check (recommended); G2, G1 plus a pale green wash down the column; G3, the day's
  header stamped in `pen` with the name in paper.
- **4, 2026-10-25:** John's comments: remove the Week column ("lets remove this column"), add a
  button to the bar that toggles full screen, and show A "with a sidebar instead of a navbar",
  hidden like the bar, expanded to "icons with the title or name", holding Settings, Print and Log
  out with room for more. Options: N1, the bar (recommended); N2, a sidebar from the left.
- **5, 2026-10-25:** John on G2's wash: "too washed out and weak. lets instead have a simple bold
  green line at the bottom of the column", in the Stamped tick's green (`pen`). The line is 6px,
  along the foot of the column; the green name and check stay.
- **6, 2026-10-25:** John on today's band: "lets remove it. we do not need to show which day of the
  week it currently is". Gone from every screen; today is still the grid's first tab stop and is
  still named "today" for a screen reader.
- **7, 2026-10-25:** John: the lines "are not thick enough. lets make them slightly curved as if
  drawn by hand - a user on a whiteboard with a green whiteboard marker has underlined the
  column", with the squiggles' "irregular organic by-hand aesthetic". Three marker strokes, one per
  day in turn: bowed, tapered to rounded ends, uneven at the edges, about 16u thick.
