A folded corner in a day's cell that says the person wrote a note for that day.

## Use

- A right triangle, 10 × 10px, filled with `ink-secondary`, its right angle flush in the top-right corner of the 56 × 60px DayMark cell. In CSS: a 10px box with `clip-path: polygon(0 0, 100% 0, 100% 100%)`.
- It sits on the done dot's cell or the empty ring's cell alike, and on the `highlight` band for today. It never touches the dot.
- Only where a note exists. Never a placeholder corner, an "add note" hint or a count of notes.
- **Print:** prints in grey, like the rings.

## Why a folded corner

- **It is a notebook's own sign** for "something on this page": a turned-down corner. It fits the brand without imitating paper.
- **It is the only angular mark.** Every other mark is a circle (the dot, the ring, the year strip), so the corner can't be mistaken for a session, at any size, in any ink, or in print.
- **It needs no font and no language.** The mockup's italic "n" was a letter: it reads as an abbreviation only in English, could be mistaken for a figure, and depends on the serif loading. A short serif stroke was the other candidate; at 10px it reads as a tick or a stray pen mark.
- **It stays out of the way.** In the corner, it never overlaps the 24px dot or the focus ring, and it is `ink-secondary`, so the done dots stay the strongest thing in the grid.

## States

One state: present. It doesn't change on hover or focus; the DayMark around it does.

## Accessibility

- `aria-hidden="true"`: "has a note" in the DayMark's accessible name carries it ("Squats, Thursday 22 October, today, has a note").
- `ink-secondary` meets 3:1 as a mark on `canvas` and `highlight` in both themes (4.5:1, measured by the gate).

## You provide

Whether the day has a note. Place it inside the positioned DayMark cell.
