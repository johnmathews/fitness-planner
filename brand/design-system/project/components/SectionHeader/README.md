The heading over a WeekGrid: the section's name in serif, one line of hint, and the section's one StatFigure.

## Use

- The title in `title-1` (Source Serif 4, 26/32, 600): "Exercises", "Diet". Sentence case, no icon.
- The hint beneath in `caption` `ink-secondary`, one line, plain instructions: "Pick three a day. Mark each one when it's done." / "Mark each day you ate it." Small numbers as words. The hint doesn't print.
- The StatFigure on the right, baseline-aligned with the title. Below 640px it wraps under the hint, still left-aligned.
- `space-6` between the header and its grid; `space-8` and a `line` rule between the Exercises and Diet sections.
- One StatFigure per section. No subtitle counts, no badges, no "This week's progress" eyebrow.

## States

| State | Look |
| --- | --- |
| Not met yet | figure in `ink` ("10 of 12 this week") |
| Met | figure in `pen` ("4 of 4 goals met") |
| Zero (a new week or account) | figure in `ink-secondary`, regular weight ("0 of 12 this week") |

## Accessibility

- The title is a real heading (`<h2>`; the week's date in the Header is the page's `<h1>`) and labels its section: `<section aria-labelledby>`. The WeekGrid's `aria-label` repeats the section and week.
- The StatFigure is plain text after the heading, read in order.

## You provide

The section title, the hint text (with the daily pick in words for exercises), and the StatFigure's figure, total, words and met state.
