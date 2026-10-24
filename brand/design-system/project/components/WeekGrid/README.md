One week, Monday to Sunday, as a grid: a row per exercise or food, a DayMark per day, the week's total at the end of each row, and for exercises a picked row that counts each day against the daily pick.

## Use

- **Columns:** the name column (200px; 136px below 640px), seven day columns, and a "Week" total column (88px; 72px below 640px). Days share the rest equally and never get narrower than 56px: the table's minimum width is the name and Week columns plus 7 × 56px, 680px (600px below 640px), and 928px (848px) in Edit plan.
- **Header:** the day in `label` ("Mon", sentence case, never "MON") over the date in `caption` `ink-secondary`. A 1px `ink` rule closes the header.
- **Rows:** the name in `body` at weight 600, then the Chip(s) for sets × reps and weight. The goal shows once, in the Week total ("2 of 4"), never as a caption under the name. Rows are separated by 1px `line` hairlines; no vertical rules, no boxed cells, no card around the grid.
- **Today:** the `highlight` band runs down today's column, header to picked row. Today's date in the header turns `ink` at weight 600. The band is the only highlight on the screen.
- **Week total:** "3 of 4" in `body-large`: the figure at weight 600, "of 4" in `ink-secondary`. When the goal is met ("3 of 3") the figure turns `pen` and a 16px Lucide `check` in `pen` follows the words, so met never rests on colour alone (Graphite's `pen` is close to `ink`; F6). It never turns red and never shows a fraction like "3/4".
- **Picked row** (exercises only): "Picked" with the pick ("3 a day") as its caption, then each day's count; the cell under "Week" stays empty (the SectionHeader's StatFigure counts the week). Under the pick: `ink-secondary`, regular weight. At the pick: `ink`, weight 600. Over the pick: `caution-ink`, underlined, with the words beneath ("one extra", "two extra"). Days still to come show an en dash in `ink-secondary`. The over-pick state never relies on colour: the underline and the words carry it in any ink and in print (F3).
- **Food:** the same grid without chips and without the Picked row (no `<tfoot>` at all); foods have no daily pick, so the band ends at the last food.
- **Phone (below 640px):** the grid keeps its 600px minimum and scrolls sideways inside its own `overflow-x: auto` container, never the page. The name column is `position: sticky; left: 0` on `canvas`, with a `line` rule on its right edge, so the name stays beside its days (K5, F1). The container sets `scroll-padding-left` to the name column's width so a focused cell scrolls clear of it, and opens scrolled so today's column is in view with the day before it, so no one has to scroll sideways to mark today. Another week opens at Monday. The phone opens on TodayList; the week grid is the second view.
- **Edit plan:** an exercise's edit (`pencil`) IconButton follows its name, 4px after it, with a -10px vertical margin so the name line keeps its height and the button keeps its 44px target; a Stepper and the remove (`trash-2`) IconButton sit beside the name block. An exercise's Stepper edits what changes most often, its reps per set (1 up, named "Squats reps") or, when timed, its seconds per set (steps of 5, "Plank seconds"); its goal is set in the Edit exercise dialog ("Times a week"). A food's Stepper edits its goal ("Nuts goal"). The name column widens by exactly what they take (a 136px Stepper, two 44px IconButtons and their gaps: 384px, 448px from 640px up). The name block is at least 44px tall, the height of the Stepper, so rows keep their height when Edit plan toggles (F25). That column is wider than the room a phone leaves for it, so in Edit plan it isn't sticky: it scrolls with the days, and the grid opens at the left edge (no scroll to today, no `scroll-padding-left`) so the names and their controls start in view.
- **Print:** black on white in either theme. Dots solid black, rings grey, the band gone, chips outlined; "one extra" keeps its underline and words. The section hint ("Mark each day you ate it.") and every button stay off paper (F24). A table split across pages repeats its `<thead>`; the Picked row's `<tfoot>` is printed as an ordinary row group (`display: table-row-group`) so it prints once, at the end, instead of on every page. In the app, put the token overrides shown in the preview's `.print` rule under `@media print`; they are the only literal colours the system allows.

## States

| Part | State | Look |
| --- | --- | --- |
| Day cell | not done / done / today / has a note / focus | see DayMark |
| Week total | under goal | figure `ink` |
| Week total | goal met | figure `pen`, then a `pen` check |
| Picked count | under the pick | `ink-secondary`, regular |
| Picked count | at the pick | `ink`, 600 |
| Picked count | over the pick | `caution-ink`, underlined, "one extra" beneath |
| Picked count | day still to come, nothing marked | en dash, `ink-secondary` |

## Accessibility

- A `<table role="grid">` (the WAI-ARIA grid pattern) with an `aria-label` naming the section and week ("Exercises, week of 19 October"). Every `<tr>` is `role="row"`. Day headers are `<th scope="col" role="columnheader">`; today's has `aria-current="date"` and a visually hidden ", today". Row names are `<th scope="row" role="rowheader">`, so a screen reader reads "Push-ups" with each cell. Day cells, week totals and the Picked row's day counts are `<td role="gridcell">`. The Picked row's empty cell under "Week" is a plain `<td aria-hidden="true">`: it has nothing to say, so it is out of the accessibility tree and out of the grid's navigation.
- **One tab stop per grid** (roving tabindex): today's cell in the first row is the single tab stop (`tabindex="0"`); every other cell is `tabindex="-1"`. Tab lands there (or on the last cell used); Tab again leaves the grid. Every cell joins the navigation except an `aria-hidden` one: the row names, the day cells, the week totals and the Picked row's name and counts. Arrow keys move cell by cell across all of them; Home and End go to the first and last cell in the row; Ctrl+Home and Ctrl+End to the first and last cell of the grid. Only the day cells act on Space and Enter (they toggle the mark); on any other cell those keys do nothing. Focus never wraps to another row. In Edit plan the row header's Stepper and IconButtons are kept out of the Tab order; Enter or F2 on the name cell lets them in, Tab moves among them, and Escape puts focus back on the cell. In a day cell the focus lands on its DayMark button (the cell's one widget); other cells take focus themselves. This brings the planner from about 77 tab stops to two (F15).
- Each DayMark is a `<button aria-pressed>` named "Push-ups, Thursday 22 October, today"; see DayMark for the full pattern.
- Week totals read as "3 of 4". A picked count over the pick reads "4, one extra"; an en dash is `aria-hidden` and a visually hidden "Not yet" is read in its place.
- The focus ring is a solid 2px `focus` outline at 2px offset, never clipped: the 44px mark sits inside a 56 × 60px cell. Cells without a mark (names, totals, the Picked row) draw the same ring inset by 2px, so the scroller never clips it. A focused cell scrolls wholly into view, clear of the sticky names.

## You provide

- The week's days, with today's index (or none, for another week).
- Rows: name, chips (from the exercise's sets, reps or duration, per side and weight), weekly goal, seven done flags and which days have a note.
- For exercises, the daily pick. For foods, nothing more.
- The toggle handler and the `aria-label` for the grid.
