One day of one exercise or food: a box drawn as if on a whiteboard, empty or filled with a marker in green (great), amber (partial) or red (missed), and the button that steps between them.

## Use

- **The box:** drawn by hand, a little uneven, about 30px across: a 40px SVG on a 36-unit square, its path stroked 1.75 units in `control-border` with round caps and joins. The box is the same in every state; marking a day never changes it.
- **The marks:** a marked day fills the box in its pen, with one of three drawings traced from the owner's own whiteboard marks:

  | Drawing | Look |
  | --- | --- |
  | Open zigzag | a back-and-forth scribble with a sharp turn at the top and paper showing between the strokes, stroked 3.5 units |
  | Solid | the box coloured in, a ragged edge just past it, filled and stroked 1.5 units |
  | Dense hatch | close diagonal strokes with slivers of paper between them, stroked 3.5 units |

  | Mark | Pen |
  | --- | --- |
  | Great | `pen` (green) |
  | Partial | `pen-partial` (amber) |
  | Missed ("tried and couldn't") | `pen-missed` (red) |

  The drawing doesn't carry meaning: any kind can use any drawing, and the pen says which kind it is (K15). The app picks the drawing from the row's name and the date (`markDrawing`), so the grid looks filled by hand and a day keeps its drawing on every render, in the week and in the Today list. Stepping a day to another kind keeps its drawing and changes its pen. All three use round caps and joins.

  The box is drawn over the fill, as a pen line shows through marker. The fills run a little past the box's edges, as if scribbled quickly by hand, so the SVG is `overflow: visible`. The paths are `BOX_PATH` and `MARK_DRAWINGS` in the app's `day-mark/index.ts`; the previews draw the same ones (`data-drawing` picks one, the open zigzag by default).
- **Empty:** the box alone. A day not marked is an empty box, never a dash or a grey mark.
- Each pen means its mark and nothing else: `pen-partial` is never a warning (`caution-ink` is over the pick), and `pen-missed` is never an error (`error-ink`); a missed day is a record, not a fault.
- **Every kind counts.** Great, partial and missed all count towards the week's totals, the Picked row and the Today summary: the person showed up.
- **Pressing steps the mark.** An exercise goes empty → great → partial → missed → empty. A food has one kind and toggles: empty ↔ great (it was eaten or it wasn't).
- The mark is a 44 × 44px button centred in a cell at least 44px tall (56 × 60px in the grid, 48 × 48px in TodayList). The rest of the cell is quiet space, so neither a stroke past the box nor the focus ring touches a neighbour or the edge of a scrolling grid.
- **Today:** the cell sits on the `highlight` band that runs down today's column; the mark itself doesn't change. The band is the only use of `highlight`.
- **Note:** a NoteMark (a 10px folded corner in `ink-secondary`) in the cell's top-right corner, flush to the corner. It sits outside the box, never on it.
- Use one size: the 40px drawing in its 44px button. The same DayMark sits in WeekGrid, in the phone's TodayList and in the Food grid.
- **Print:** the light theme's colours on white paper, from either theme: the box and the marks keep their light colours, and the band disappears (K16). See WeekGrid.

## States

| State | Look |
| --- | --- |
| Empty | the `control-border` box |
| Empty, hover | the box darkens to `ink` |
| Great | the box filled in `pen` |
| Partial | the box filled in `pen-partial` |
| Missed | the box filled in `pen-missed` |
| Today | any of the above on `highlight` |
| Has a note | any of the above plus the folded corner |
| Keyboard focus | solid 2px `focus` outline at 2px offset around the 44px button, never clipped |

A marked box doesn't change on hover. A press draws the next mark at once; the box's hover colour changes in 120ms at most, and not at all under `prefers-reduced-motion`. Nothing celebrates: no pop, bounce, draw-on animation or confetti.

## Accessibility

- A `<button type="button">` with `aria-pressed`, true for any mark, so a screen reader announces the change when a day is marked or cleared. The name says which day of which row; it adds the kind only for partial and missed, since pressed already says a great day is marked:

  | Cell | Accessible name | State |
  | --- | --- | --- |
  | Push-ups, Monday, great | "Push-ups, Monday 19 October" | pressed |
  | Squats, today, great | "Squats, Thursday 22 October, today" | pressed |
  | Squats, today, partial | "Squats, Thursday 22 October, today, partly done" | pressed |
  | Squats, today, missed | "Squats, Thursday 22 October, today, couldn't do it" | pressed |
  | Squats, today, partial, with a note | "Squats, Thursday 22 October, today, has a note, partly done" | pressed |
  | Fish, Saturday, empty | "Fish, Saturday 24 October" | not pressed |

  VoiceOver reads the fifth as "Squats, Thursday 22 October, today, has a note, partly done, toggle button, selected". Write the weekday and the month in full in the name; the visible header can stay "Thu 22".
- Today's mark says so twice: `aria-current="date"` on the button, and "today" in its name. The name carries it for every screen reader; `aria-current` lets assistive tech and the grid's keyboard model (WeekGrid) find today's mark without parsing words. Neither depends on the band, so today never rests on colour (F16).
- The NoteMark is `aria-hidden`; "has a note" in the name carries it.
- Enter and Space step the mark. Inside a WeekGrid the mark is one cell of a roving-tabindex grid (see WeekGrid); on its own it is an ordinary tab stop.
- Contrast, measured by the gate in both themes: `pen` reaches 4.5:1 on `canvas` and `panel` (it is also the text of a met total) and 3:1 on `tile` and `highlight`; `pen-partial` and `pen-missed` reach 3:1 on `canvas`, `panel`, `tile` and `highlight`; the box is `control-border`, 3:1 on `canvas`, `panel`, `tile` and `highlight`. The kinds are told apart by their pens, the owner's call (K15): a fill of any kind differs from the empty box by shape, and the accessible name says "partly done" or "couldn't do it", but someone who can't tell green from red sees only "marked".

## You provide

The row's name, the full date, whether it's today, the day's mark (`null | 'great' | 'partial' | 'missed'`), whether it has a note, and the press handler, which sets the next mark in the row's cycle (`nextMark` with `EXERCISE_CYCLE` or `FOOD_CYCLE` in `lib/tracker.ts`). The pens are fixed tokens; there is nothing to set.
