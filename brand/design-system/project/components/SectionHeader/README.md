The heading over a WeekGrid: the section's name in serif, the week beside it, and an optional line of hint.

## Use

- The title in `title-1` (Source Serif 4, 30/36, 600): "Exercises", "Food". Sentence case, no icon. On a PlannerScreen it grows with the screen, 40u (40px at 1280×800), never below `title-1`.
- **The week** follows the title on its baseline, 16u after it, in `ink-secondary` at max(16px, 20u): "19–25 October", as the Header writes it. It is how the week shows while the bar is out of sight. Folded (a screen held upright) it is left out, since the line has no room; the bar has the week.
- An optional hint beneath in `caption` `ink-secondary`, one line, plain instructions. Small numbers as words. The hint doesn't print. Neither section uses one: the user asked for both to go (journal 261024, 261025).
- 20u between the header and its grid. Each section is a PlannerScreen of its own, so nothing rules them apart.
- No figure (K31): the sections' weekly totals ("15 of 15 this week", "0 of 4 goals met") were removed by the owner's choice. The marks, and the days that turn green, say how the week is going. No subtitle counts, no badges, no "This week's progress" eyebrow.

## States

| State | Look |
| --- | --- |
| On a PlannerScreen | the title at 40u, the week beside it |
| Folded, or in Edit plan | the title alone |
| Short | moved into the WeekGrid's corner; here only for a screen reader |

## Accessibility

- The title is a real heading, an `<h2>`, and labels its section: `<section aria-labelledby>`. The page's one `<h1>` is the week date ("19–25 October"), visually hidden on the planner's screens and set in `display` above the sections in Edit plan; the Header (the app bar) holds no heading. The WeekGrid's `aria-label` repeats the section and week.
- The week beside the title is `aria-hidden`: the page's `<h1>` already says it.

## You provide

The section title, the week label, and the hint text when there is one.
