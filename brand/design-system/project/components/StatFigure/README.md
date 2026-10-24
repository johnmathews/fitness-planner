The one strong number in a section: a figure and the words that say what it counts, in `pen` with a check once the goal is met.

## Use

- The figure at 20/26 weight 600 (the `title-2` size, in Source Sans 3), tabular; the words after it in `body-large` `ink-secondary`, on the same baseline, `space-2` apart.
- **Exercises:** sessions done this week "of" the sum of the weekly goals: "10 of 12 this week". Met once the sessions reach a non-zero sum.
- **Diet:** foods whose weekly goal is met, of all foods: "2 of 4 goals met". Met once every food's goal is.
- One StatFigure per section, in its SectionHeader. Never a second big number, a percentage, a progress bar or a ring chart.
- Figures, not words: this is data. In running sentences (TodayList's summary) small numbers become words instead.

## States

| State | Figure | Example |
| --- | --- | --- |
| Met | `pen`, 600, then a 16px `check` icon in `pen` | "12 of 12 this week" ✓ |
| Not met yet | `ink`, 600 | "10 of 12 this week" |
| Zero | `ink-secondary`, 400 | "0 of 12 this week" |

Met never rests on colour alone: Graphite's `pen` is close to `ink`, so the check is what tells met from not met yet in every ink (F6). The check is Lucide `check`, 16px at 1.5px stroke, after the words and centred on their line, `aria-hidden` like every icon. Zero is never in `pen` or a success colour, and never gets the check: a fresh week or a new account starts quiet (F13). Going over the goal stays `pen` with the check ("13 of 12 this week"); there is no over state for the week.

## Accessibility

- Plain text in a `<p>`; it reads "10 of 12 this week". The check is decorative (`aria-hidden`): the words already say how many of how many. Don't make it a live region: the DayMark that changed it already announces.
- `pen` as text meets 4.5:1 on `canvas` in every ink (the gate measures each ink on `canvas` and `panel`); `ink-secondary` meets 4.5:1 on `canvas`, `panel`, `tile` and `highlight`.

## You provide

The figure, the total it is measured against and the words after it, and whether the goal is met.
