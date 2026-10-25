The heading over a WeekGrid: the section's name in serif, an optional line of hint, and the section's one StatFigure.

## Use

- The title in `title-1` (Source Serif 4, 26/32, 600): "Exercises", "Food". Sentence case, no icon.
- An optional hint beneath in `caption` `ink-secondary`, one line, plain instructions. Small numbers as words. The hint doesn't print. Neither section uses one: the user asked for both to go (journal 261024, 261025).
- The StatFigure on the right, baseline-aligned with the title. Below 640px it wraps under the title and hint, still left-aligned.
- `space-6` between the header and its grid; `space-8` and a `line` rule between the Exercises and Food sections.
- One StatFigure per section. No subtitle counts, no badges, no "This week's progress" eyebrow.

## States

| State | Look |
| --- | --- |
| Not met yet | figure in `ink` ("10 of 12 this week") |
| Met | figure in `pen` ("4 of 4 goals met") |
| Zero (a new week or account) | figure in `ink-secondary`, regular weight ("0 of 12 this week") |

## Accessibility

- The title is a real heading, an `<h2>`, and labels its section: `<section aria-labelledby>`. The page's one `<h1>` is the week date ("19–25 October"), set in `display` by the page above the sections; the Header (the app bar) holds no heading. The WeekGrid's `aria-label` repeats the section and week.
- The StatFigure is plain text after the heading, read in order.

## You provide

The section title, the hint text when there is one, and the StatFigure's figure, total, words and met state.
