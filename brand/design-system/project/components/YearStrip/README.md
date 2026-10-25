A year of weeks in one quiet strip: one `pen` dot per week, sized by the sessions done, an empty ring for a week off, and nothing for weeks still to come.

## Use

- Part of the record layer: small, dense and `ink-secondary` around the marks. It sits below the week's grids, never above them.
- **One slot per week**, Monday to Sunday, 52 or 53 per year, oldest first. Two half-years of 26 slots each: side by side when there is room, stacked below about 640px. Slots are 28px tall between two `line` rules.
- **Three sizes, not shades.** Dot diameter steps with the week's sessions: 11px for 12 or more, 8px for 6 to 11, 5px for 1 to 5. Every dot is solid `pen`; never fade a dot with opacity, which drops it below 3:1.
- **A week off** is a 9px ring, 1.5px `control-border`: an empty sign, as an empty box is for a day. No label, no red, no gap in the strip.
- **Weeks still to come** are empty slots.
- **This week** carries a 9 × 2px `ink` bar under its dot. It is not highlighted: `highlight` is for today's column only.
- Month labels in `caption` `ink-secondary` under the strip, at the first Monday of January, April, July and October.
- A legend line beneath in `caption` repeats the three sizes, the ring and the bar.
- The heading is the year in `title-2`, with one plain line beside it: "One mark per week, oldest first." Never a count of weeks off, a run length or a comparison with last year.
- No chart library, no axes, no hover tooltips. If someone wants the detail, a week's slot opens that week.

## States

| Week | Mark |
| --- | --- |
| 12 or more sessions | 11px `pen` dot |
| 6 to 11 sessions | 8px `pen` dot |
| 1 to 5 sessions | 5px `pen` dot |
| No sessions | 9px `control-border` ring |
| Still to come | empty |
| This week | its dot plus the `ink` bar |

The thresholds are fixed numbers, not relative to the person's goals, so the strip reads the same when the plan changes.

## Accessibility

- Each half is an `<ol>` labelled "January to June" or "July to December"; each past week is an `<li>` with visually hidden text: "Week of 19 October, this week: 10 sessions", "Week of 9 February: none". Future slots are `aria-hidden`.
- The legend is `aria-hidden`; the hidden text already gives the count.
- If a slot opens its week, make each past slot a link, at least 24px wide on a phone (the strip then scrolls inside its own container rather than shrinking slots below that).
- `pen` dots meet 3:1 on `canvas` in every ink; the ring is `control-border`, 3:1 on `canvas` (measured by the gate).

## You provide

The year, the Monday of its first week, sessions per past week, and which week is this week.
