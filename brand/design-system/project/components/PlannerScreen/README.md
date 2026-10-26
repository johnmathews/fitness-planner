The planner's layout: Exercises and Food each fill the screen, the page sprints from one to the other, and the Header keeps out of sight until it is wanted.

## Use

- **One section per screen** (K24). Exercises is the first screen and Food the next. Each is at least the screen's height (`100dvh`). The page's `scroll-padding-top` is 0 here, since no bar covers the top.
- **Sprinting, not snapping** (K38). A screen with more rows than fit scrolls as usual. The page never comes to rest showing part of both screens: once a scroll stops (120ms still) across the line between them, the page sprints on in the direction it was going, down to the next screen's top or up so the earlier screen's end meets the bottom of the window, smoothly unless motion is reduced. This is script, not CSS snapping: with `scroll-snap-type: y mandatory`, a mouse wheel at the end of a tall screen snapped back instead of crossing to the next.
- **Inside a screen:** a column holding the SectionHeader, then its WeekGrid, which takes the rest of the height (WeekGrid, Filling the screen). When the week is shorter than the screen it sits in the middle. Padding follows the screen's scale `u` (WeekGrid): 28u at the top, 48u at the sides, 20u at the foot. Folded (held upright), 34n at the top for the handle and 16n at the sides.
- **The way on:** a quiet Button at the foot of the Exercises screen, "Food" with a 20px Lucide `chevron-down` after it, centred, in `ink-secondary` at max(16px, 18u), weight 600. It scrolls to the Food screen (smoothly, unless `prefers-reduced-motion`). Food has none: it is the last screen. A short screen and a folded one leave it out.
- **The bar** is the Header, out of sight (Header, Out of sight): the top-edge strip for a pointer, the handle for a finger, focus for the keyboard.
- **Messages** (Banner: sync, confirm your email, import) sit at the top of the Exercises screen, above its SectionHeader, and push the week down while they show.
- **Every screen size gets this layout.** A desktop, an iPad on its side and a phone on its side get the wide grid; a screen held upright under 1000px wide, or any screen under 760px wide, gets the folded one (K26). There is no separate phone view.
- **Not in Edit plan or Settings** (K27): there the page scrolls freely, nothing sprints, the bar stays in view, the sections are as tall as their content, and the week's `<h1>` shows in `display` above them.
- **Print** is unchanged: no sprinting, no bar, the WeekGrid as a table on paper.

## States

| State | Look |
| --- | --- |
| At rest | the screen alone: the title line, the week, and on the first screen the way on |
| Bar called up | the Header over the top of the screen, with `shadow-overlay` |
| Short (540px tall or less) | the title in the grid's corner; no chips, no way on |
| Folded (upright under 1000px wide, or under 760px wide) | the WeekGrid folded; the week's name left off the title line |

## Accessibility

- Each screen is a `<section aria-labelledby>` on its SectionHeader's `<h2>`. The week's `<h1>` stays in the page, visually hidden, so the heading outline is unchanged.
- The sprint never traps the keyboard: focus moving into the Food grid scrolls it into view, and a stop across the line sprints on to Food's screen.
- The way on is a real `<button>` named by its words, "Food".
- Nothing depends on hover: the handle and focus reach the bar everywhere the top-edge strip can't.

## You provide

- The two sections, in order, and whether Edit plan or another page is showing (which turns the layout off).
- The messages to show, if any.
