# Tracker: a rename, item notes, a quicker sprint, and the squiggles' stale tab

John asked for five things in one message: rename the project "tracker"; snap between the two
screens without waiting for the scroll to stop; an arrow instead of "Food ⌄", and one at the top of
Food; an optional markdown note on every item; and the three squiggle drawings back. The work ran
as one engineering-team cycle on the `eng-tracker` branch and ships as one PR.

## The squiggles were a stale tab, again

On local `main` ten presses gave all nine marks and then empty, and the deployed bundle held the
same cycle, so the code was right. John saw it on his desktop. #38 had added `-solid` and `-hatch`
mark values under the `-v2` cache and outbox names, against K14. A tab still open from before #38
reads those values as empty days and writes its copy back, so the solid square appeared for a
moment and cleared. That is the same failure `261025-stale-tab.md` recorded.

The fix moves both keys to `-v3` and moves every older version at sign-in, newest first (K41). The
regression test fails on `-v2` and passes on `-v3`. K14 was prose, so `format.spec.ts` now
records what each key version stores and fails when that changes under the same key. Adding a
drawing without a bump turned it red.

John's own check (reload every tab, press four times) was still to come at handover.

## Decided on a mockup

`brand/design-system/mockups/261026-cues-notes-name`, two rounds: a bare chevron (K42), notes
under the name with the chips moved up onto the name's line (K43), "Tracker" with no monogram
(K44), and the new snap (K45). The prototype's sprint was measured before anyone tried it: under a
steady 1.2 s scroll it settled on Food at about 270 ms.

## What was built

- **Sprint (K45).** A new e2e test reproduced the wait first: a short fling reached Food 403 ms
  after it ended. Now a wheel or a fling sprints once the next screen is 4% into the window. A
  finger waits until it lifts. The sprint runs 260 ms, eased out, setting the position each
  frame, and the wheel is swallowed until it has been quiet for 180 ms. The unit tests caught one
  gap on the way: the rest timer would have sprinted under a finger still held on the screen.
- **Arrows (K42).** IconButtons with 24px chevrons, named "Go to Food" and "Back to Exercises".
  The up arrow sits 48px down, not on Food's top edge, because the bar's 14px hover strip and its
  88 × 44px touch handle sit on that edge.
- **Notes (K43).** `notes` on exercises and foods, normalised the same way in TypeScript and
  Python (500 characters counted as code points), in a shared fixture, and in export version 4.
  markdown-it 14 renders them, with raw HTML, images, headings, tables and rules off. The row's
  line is one button, so a link shows there as underlined text; the Popover has the working link.
  jsdom couldn't show the open Popover inside the grid, so that check lives in `e2e/notes.spec.ts`.
- **Rename (K44).** Every name moved, data included: `migrateKeyPrefix` now takes a list of old
  prefixes, so a browser's keys were moved in place on the first reload and the session stayed
  signed in. Both images build, and `tracker-admin` runs in the API image.

## Left for after the merge

- `gh repo rename tracker`, when John says so.
- The home-server compose template moves to `ghcr.io/johnmathews/tracker` and `tracker-api`, and
  `MAIL_FROM` to "Tracker". Until then the server runs the last `fitness-planner` build.
- Republish the design system: upload the two `tracker-wordmark-*.svg` files, and its asset
  records in `design-system.json` take the new upload ids.
- Optionally, move `~/projects/fitness-planner` to `~/projects/tracker`.
