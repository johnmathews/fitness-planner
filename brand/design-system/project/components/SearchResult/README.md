One row in the search results: a note or an exercise that matched, with the day it belongs to and the matched words set in bold and underlined.

## Use

- Part of the record layer: plain, chronological and quiet, newest first. Search is how the person finds an old note; nothing more clever than that.
- **A note result:** the exercise name in `body` at 600, the full date beside it in `caption` `ink-secondary` ("Thursday 22 October"; add the year when it isn't this year), then the excerpt in the `note` style (serif italic, `ink`), at most two lines, cut with an ellipsis. When the match is late in a long note, start the excerpt a few words before it with a leading "…".
- **An exercise result:** the name, then a `caption` line saying what it is ("Exercise · in your plan since 12 October").
- **The match:** a `<mark>` styled with weight 600 and a 1px underline at 3px offset, in the text's own colour. Never the `highlight` fill: that colour means today.
- Results sit between `line` hairlines. The whole row is one link to that week (or the exercise's first week), with `tile` on hover and `space-3` vertical padding.
- No count of its own. The SearchField above the list owns the single count line and announces it ("Three notes mention “knee”.", "No notes mention “knee”."); the results never repeat it.

## States

| State | Look |
| --- | --- |
| Rest | as above |
| Hover | `tile` fill |
| Focus | solid 2px `focus` outline at 2px offset around the row |
| Long note | two lines, then an ellipsis; the match stays visible |

## Accessibility

- A `<ul>` of links; each link's text reads in order: "Squats, Thursday 22 October, Left knee twinge. Went to 3 × 10, no jumps."
- `<mark>` keeps its meaning for assistive technology that reports it; the weight and underline show it without colour.
- The list is not a live region. The new count is announced by SearchField's one `aria-live` status line as the person types.
- `ink` and `ink-secondary` on `tile` are measured by the gate.

## You provide

For each result: the exercise name, the date (or the exercise's first week), the excerpt with match ranges, and the link target. The count belongs to SearchField.
