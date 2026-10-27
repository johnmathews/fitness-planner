The heading over a WeekGrid: the section's name in serif, the week beside it, and an optional line of hint.

## Use

- The title in `title-1` (Source Serif 4, 30/36, 600): "Exercises", "Food". Sentence case, no icon. On screen (a PlannerScreen, and Edit plan since K54) it grows with the screen, 40u (40px at 1280×800), never below `title-1`; on paper it is `title-1`.
- **The week** follows the title on its baseline, 16u after it, in `ink-secondary` at max(16px, 20u): "19–25 October", as the Header writes it. It is how the week shows while the bar is out of sight. Edit plan leaves it out (K56): the bar is always in sight there and shows the week. Folded (a screen held upright) it is left out too, since the line has no room.
- **Actions:** an optional slot centred on the title line. On screen the line is three columns, like the Header's (1fr, the actions, 1fr), so the actions sit under the bar's week. Edit plan puts the section's daily target there (K56, K62, K63): a Stepper at max(44px, 40u), 1 to 8, its value reading "4 per day", with no words beside it; its label ("Exercises a day", "Foods a day") is for a screen reader. Folded, it follows the title and wraps under it.
- An optional hint beneath in `caption` `ink-secondary`, one line, plain instructions. Small numbers as words. The hint doesn't print. Neither section uses one: the user asked for both to go (journal 261024, 261025).
- 20u between the header and its grid. Each section is a PlannerScreen of its own, so nothing rules them apart.
- No figure (K31): the sections' weekly totals ("15 of 15 this week", "0 of 4 goals met") were removed by the owner's choice. The marks, and the days that turn green, say how the week is going. No subtitle counts, no badges, no "This week's progress" eyebrow.

## States

| State | Look |
| --- | --- |
| On a PlannerScreen | the title at 40u, the week beside it |
| In Edit plan | the title at 40u alone, the daily target centred on the line |
| Folded | the title alone (and its action under it) |
| Short | moved into the WeekGrid's corner; here only for a screen reader |

## Accessibility

- The title is a real heading, an `<h2>`, and labels its section: `<section aria-labelledby>`. The page's one `<h1>` is the week date ("19–25 October"), visually hidden on screen (the planner's screens and Edit plan) and set in `display` above the sections on paper; the Header (the app bar) holds no heading. The WeekGrid's `aria-label` repeats the section and week.
- The week beside the title is `aria-hidden`: the page's `<h1>` already says it.

## You provide

The section title, the week label (left out in Edit plan), the hint text when there is one, and optionally actions for the title line (Edit plan's daily target).
