One week, Monday to Sunday, as a grid: a row per exercise or food, a DayMark per day, the week's total at the end of each row, and for exercises a picked row that counts each day against the daily pick.

## Use

- **Columns:** the name column (200px; 136px below 640px), seven day columns, and a "Week" total column (88px; 72px below 640px). Days share the rest equally and never get narrower than 56px.
- **Header:** the day in `label` ("Mon", sentence case, never "MON") over the date in `caption` `ink-secondary`. A 1px `ink` rule closes the header.
- **Rows:** the name in `body` at weight 600, then the Chip(s) for sets × reps and weight, then the goal ("4 a week") in `caption` `ink-secondary`. Rows are separated by 1px `line` hairlines; no vertical rules, no boxed cells, no card around the grid.
- **Today:** the `highlight` band runs down today's column, header to picked row. Today's date in the header turns `ink` at weight 600. The band is the only highlight on the screen.
- **Week total:** "3 of 4" in `body-large`: the figure at weight 600, "of 4" in `ink-secondary`. The figure turns `pen` when the goal is met ("3 of 3"). It never turns red and never shows a fraction like "3/4".
- **Picked row** (exercises only): "Picked" with the pick ("3 a day") as its caption, then each day's count. Under the pick: `ink-secondary`, regular weight. At the pick: `ink`, weight 600. Over the pick: `caution-ink`, underlined, with the words beneath ("one extra", "two extra"). Days still to come show an en dash in `ink-secondary`. The over-pick state never relies on colour: the underline and the words carry it in any ink and in print (F3).
- **Diet:** the same grid without chips and without the picked row; foods have no daily pick.
- **Phone (below 640px):** the grid keeps its 600px minimum and scrolls sideways inside its own `overflow-x: auto` container, never the page. The name column is `position: sticky; left: 0` on `canvas`, with a `line` rule on its right edge, so the name stays beside its days (K5, F1). The container sets `scroll-padding-left` to the name column's width so a focused cell scrolls clear of it, and opens scrolled so today's column is in view with the day before it, so no one has to scroll sideways to mark today. The phone opens on TodayList; the week grid is the second view.
- **Edit plan:** the edit and remove IconButtons and the goal Stepper replace the goal caption inside the same row height, so rows don't jump when Edit plan toggles (F25).
- **Print:** black on white in either theme. Dots solid black, rings grey, the band gone, chips outlined; "one extra" keeps its underline and words. The hint line ("Mark each one when it's done") and every button stay off paper (F24). In the app, put the token overrides shown in the preview's `.print` rule under `@media print`; they are the only literal colours the system allows.

## States

| Part | State | Look |
| --- | --- | --- |
| Day cell | not done / done / today / has a note / focus | see DayMark |
| Week total | under goal | figure `ink` |
| Week total | goal met | figure `pen` |
| Picked count | under the pick | `ink-secondary`, regular |
| Picked count | at the pick | `ink`, 600 |
| Picked count | over the pick | `caution-ink`, underlined, "one extra" beneath |
| Picked count | day still to come, nothing marked | en dash, `ink-secondary` |

## Accessibility

- A `<table role="grid">` (the WAI-ARIA grid pattern) with an `aria-label` naming the section and week ("Exercises, week of 19 October"). Every `<tr>` is `role="row"`. Day headers are `<th scope="col" role="columnheader">`; today's has `aria-current="date"` and a visually hidden ", today". Row names are `<th scope="row" role="rowheader">`, so a screen reader reads "Push-ups" with each cell. Day cells, week totals and every cell of the Picked row are `<td role="gridcell">`.
- **One tab stop per grid** (roving tabindex): today's cell in the first row is the single tab stop (`tabindex="0"`); every other cell is `tabindex="-1"`. Tab lands there (or on the last cell used); Tab again leaves the grid. Every cell joins the navigation: the row names, the day cells, the week totals and the whole Picked row. Arrow keys move cell by cell across all of them; Home and End go to the first and last cell in the row; Ctrl+Home and Ctrl+End to the first and last cell of the grid. Only the day cells act on Space and Enter (they toggle the mark); on any other cell those keys do nothing. Focus never wraps to another row. In a day cell the focus lands on its DayMark button (the cell's one widget); other cells take focus themselves. This brings the planner from about 77 tab stops to two (F15).
- Each DayMark is a `<button aria-pressed>` named "Push-ups, Thursday 22 October, today"; see DayMark for the full pattern.
- Week totals read as "3 of 4". A picked count over the pick reads "4, one extra"; an en dash is `aria-hidden` and a visually hidden "Not yet" is read in its place.
- The focus ring is a solid 2px `focus` outline at 2px offset, never clipped: the 44px mark sits inside a 56 × 60px cell. Cells without a mark (names, totals, the Picked row) draw the same ring inset by 2px, so the scroller never clips it.

## You provide

- The week's days, with today's index (or none, for another week).
- Rows: name, chips (from the exercise's sets, reps, per side and weight), weekly goal, seven done flags and which days have a note.
- For exercises, the daily pick. For foods, nothing more.
- The toggle handler and the `aria-label` for the grid.
