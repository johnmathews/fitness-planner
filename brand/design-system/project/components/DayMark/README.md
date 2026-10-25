One day of one exercise or food: a box drawn as if on a whiteboard, filled with a `pen` marker squiggle when it's done and empty when it isn't, and the button that switches between them.

## Use

- **The box:** drawn by hand, a little uneven, about 30px across: a 40px SVG on a 36-unit square, its path stroked 1.75 units in `control-border` with round caps and joins. The paths are `BOX_PATH` and `SQUIGGLE_PATH` in the app's `day-mark/index.ts`; the previews draw the same ones.
- **Done:** a marker squiggle in the box, stroked 3.5 units in `pen` with round caps and joins, back and forth from top to bottom as a hand fills a box with a marker. The box stays `control-border`. `pen` means done and nothing else.
- **Not done:** the empty box. A day off is an empty box, never a cross, a dash or red.
- The mark is a 44 × 44px button centred in a cell at least 44px tall (56 × 60px in the grid, 48 × 48px in TodayList). The rest of the cell is quiet space, so the focus ring never touches a neighbour or the edge of a scrolling grid.
- **Today:** the cell sits on the `highlight` band that runs down today's column; the mark itself doesn't change. The band is the only use of `highlight`.
- **Note:** a NoteMark (a 10px folded corner in `ink-secondary`) in the cell's top-right corner, flush to the corner. It sits outside the box, never on it.
- Use one size: the 40px drawing in its 44px button. The same DayMark sits in WeekGrid, in the phone's TodayList and in the Food grid.
- **Inks:** the squiggle takes `pen`, which the app sets from the person's ink: `ink-blue` (default), `forest`, `violet` or `graphite`. Set `--pen` once, high in the page; never paint two inks on one screen.
- **Print:** the squiggle prints solid black, the box grey; the band disappears. See WeekGrid.

## States

| State | Look |
| --- | --- |
| Not done | the empty `control-border` box |
| Not done, hover | the box darkens to `ink` |
| Done | the `pen` squiggle in the box |
| Today | either of the above on `highlight` |
| Has a note | either of the above plus the folded corner |
| Keyboard focus | solid 2px `focus` outline at 2px offset around the 44px button, never clipped |

Toggling draws or removes the squiggle at once; the box's hover colour changes in 120ms at most, and not at all under `prefers-reduced-motion`. Nothing celebrates: no pop, bounce, draw-on animation or confetti.

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
- Contrast: the squiggle's `pen` meets 3:1 on `canvas` and `highlight` in every ink and both themes; the box is `control-border`, 3:1 on `canvas`, `panel` and `highlight`. Done never rests on colour: the squiggle is a shape the empty box doesn't have. All are measured by the gate.

## You provide

The row's name, the full date, whether it's today, whether it's done, whether it has a note, and the toggle handler. Set `--pen` from the person's ink on an ancestor.
