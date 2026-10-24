The one strong number in a section: a figure and the words that say what it counts, in `pen` once the goal is met.

## Use

- The figure at 20/26 weight 600 (the `title-2` size, in Source Sans 3), tabular; the words after it in `body-large` `ink-secondary`, on the same baseline, `space-2` apart.
- **Exercises:** sessions done this week "of" the sum of the weekly goals: "10 of 12 this week".
- **Diet:** foods whose weekly goal is met, of all foods: "2 of 4 goals met".
- One StatFigure per section, in its SectionHeader. Never a second big number, a percentage, a progress bar or a ring chart.
- Figures, not words: this is data. In running sentences (TodayList's summary) small numbers become words instead.

## States

| State | Figure | Example |
| --- | --- | --- |
| Met | `pen`, 600 | "12 of 12 this week" |
| Not met yet | `ink`, 600 | "10 of 12 this week" |
| Zero | `ink-secondary`, 400 | "0 of 12 this week" |

Zero is never in `pen` or a success colour: a fresh week or a new account starts quiet (F13). Going over the goal stays `pen` ("13 of 12 this week"); there is no over state for the week.

## Accessibility

- Plain text in a `<p>`; it reads "10 of 12 this week". Don't make it a live region: the DayMark that changed it already announces.
- `pen` as text meets 4.5:1 on `canvas` in every ink (the gate measures each ink on `canvas` and `panel`); `ink-secondary` meets 4.5:1 on `canvas`, `panel`, `tile` and `highlight`.

## You provide

The figure, the total it is measured against and the words after it, and whether the goal is met.
