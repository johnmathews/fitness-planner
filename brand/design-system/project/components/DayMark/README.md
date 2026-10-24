One day of one exercise or food: a filled `pen` dot when it's done, an empty ring when it isn't, and the button that switches between them.

## Use

- **Done:** a 24px dot filled with `pen`, centred in its cell. `pen` means done and nothing else.
- **Not done:** a 24px ring, 1.5px `control-border`, no fill. A day off is an empty ring, never a cross, a dash or red.
- The mark is a 44 × 44px button centred in a cell at least 44px tall (56 × 60px in the grid, 48 × 48px in TodayList). The rest of the cell is quiet space, so the focus ring never touches a neighbour or the edge of a scrolling grid.
- **Today:** the cell sits on the `highlight` band that runs down today's column; the mark itself doesn't change. The band is the only use of `highlight`.
- **Note:** a NoteMark (a 10px folded corner in `ink-secondary`) in the cell's top-right corner, flush to the corner. It never covers the dot.
- Use one size: 24px. The same DayMark sits in WeekGrid, in the phone's TodayList and in the Diet grid.
- **Inks:** the dot takes `pen`, which the app sets from the person's ink: `ink-blue` (default), `forest`, `violet` or `graphite`. Set `--pen` once, high in the page; never paint two inks on one screen.
- **Print:** the dot prints solid black, the ring grey; the band disappears. See WeekGrid.

## States

| State | Look |
| --- | --- |
| Not done | `control-border` ring |
| Not done, hover | ring darkens to `ink` |
| Done | `pen` dot |
| Today | either of the above on `highlight` |
| Has a note | either of the above plus the folded corner |
| Keyboard focus | solid 2px `focus` outline at 2px offset around the 44px button, never clipped |

Toggling changes colour only, in 120ms at most and not at all under `prefers-reduced-motion`. Nothing celebrates: no pop, bounce or confetti.

## Accessibility

- A `<button type="button">` with `aria-pressed` for the state, so a screen reader announces the change when it flips. The name says which day of which row, and never repeats the state:

  | Cell | Accessible name | State |
  | --- | --- | --- |
  | Push-ups, Monday, done | "Push-ups, Monday 19 October" | pressed |
  | Push-ups, today, done | "Push-ups, Thursday 22 October, today" | pressed |
  | Squats, today, done, with a note | "Squats, Thursday 22 October, today, has a note" | pressed |
  | Fish, Saturday, not done | "Fish, Saturday 24 October" | not pressed |

  VoiceOver reads the third as "Squats, Thursday 22 October, today, has a note, toggle button, selected". Write the weekday and the month in full in the name; the visible header can stay "Thu 22".
- Today's mark says so twice: `aria-current="date"` on the button, and "today" in its name. The name carries it for every screen reader; `aria-current` lets assistive tech and the grid's keyboard model (WeekGrid) find today's mark without parsing words. Neither depends on the band, so today never rests on colour (F16).
- The NoteMark is `aria-hidden`; "has a note" in the name carries it.
- Enter and Space toggle. Inside a WeekGrid the mark is one cell of a roving-tabindex grid (see WeekGrid); on its own it is an ordinary tab stop.
- Contrast: the dot meets 3:1 on `canvas` and `highlight` in every ink and both themes; the ring is `control-border`, 3:1 on `canvas`, `panel` and `highlight`. All are measured by the gate.

## You provide

The row's name, the full date, whether it's today, whether it's done, whether it has a note, and the toggle handler. Set `--pen` from the person's ink on an ancestor.
