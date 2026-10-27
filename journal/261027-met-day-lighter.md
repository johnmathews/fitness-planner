# A met day, lighter

> Purpose: why a met day lost its check and its column stroke, and why the day names grew.

## 1. The ask

With the daily targets in Edit plan, John looked at the week again. The green stroke under a met
day's column was "too chunky and visually heavy", and the check after the day's name too slight.
The ask was a thinner stroke and a bigger check, and a look at a version with the day's name
underlined and no stroke at all.

## 2. The decision

The mockup `brand/design-system/mockups/261027-met-day-weight` took two rounds.

1. **Where a met day shows.** A kept the stroke at a third of its height, and B underlined the
   day's name instead. John picked B, with the line under the check too, and asked for bigger
   day names.
2. **How big the day names are.** 24u or 27u, the rows' name size. On a phone the check no
   longer fitted beside a 27u name in a 51px column, so the mockup left it off there. John
   picked 27u and dropped the check at every width.

So a met day is its name in `pen`, underlined, and nothing else (K60). That supersedes K39's
stroke and K30's check.

## 3. How it is built

- `TrackerGrid` draws a met day's name with Tailwind's `underline`, `decoration-[max(2px,3u)]`
  and `underline-offset-[0.22em]`. The Lucide check is gone.
- `TrackerRow` no longer draws the stroke, and no longer takes `metDays` or `last`. DayMark's
  `MET_UNDERLINES` is gone with it.
- `--fs-day` is max(20px, 27u) on screen, 20n folded and 20px on paper.
- The WeekGrid and PlannerScreen previews draw the same, and the WeekGrid card, foundations,
  architecture, development and brand docs say so.

## 4. Checks

`vitest`, `vue-tsc`, `oxlint` and `eslint`, `prettier --check`, coverage at its thresholds, the
Playwright suite (axe and the 375px no-sideways-scroll checks) and `check_design_system.py
--complete`. The planner test now checks a met day's name for the underline and for no check.

## 5. What is deliberately not done

- **No other mark of a met day.** No check, no column stroke, no wash: the owner wanted the
  green underlined name alone. A screen reader still hears ", daily goal met".
- **The DayMark drawings are unchanged.** Only the header of a met day changed.
