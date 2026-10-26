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

John then reloaded every tab and pressed an empty box four times: "Yes, solid square". Status:
confirmed (W7).

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

## Caught in the wrap-up

A fresh code reviewer and a fresh docs auditor read the branch before the PR.

- **The sprint's first frame could run backwards.** A sprint begun in a scroll handler can get a
  frame time just before its start, so the eased position went negative for one frame. That is up
  to about 70px the wrong way. Status: strongly supported (reasoned from the frame timing rules,
  not seen on screen). The progress is now clamped at 0.
- **A scrollbar drag or the keyboard sprinted early.** The trigger couldn't tell them from a
  wheel, so a drag fought the sprint. Status: confirmed by reading the code against K45's wording.
  A scroll now sprints at once only within 150 ms of a wheel event or 1.2 s of a finger lifting
  (a fling's momentum). A new unit test holds a wheel-less scroll to the rest timer.
- **Coverage.** The suite's floors (100% lines and functions) failed on the new code. The gaps
  were the note popover's body, the touch lock and the dialogs' Note boxes. New tests cover them,
  including `TrackerRow.spec.ts`. That file mounts a row on its own, where jsdom does open the
  popover.
- **Docs.** 13 findings: the import's version range and old formats, the chips' new place, the
  component tree, the deployment note that `fitness-planner` images stop updating, the README's
  notes and arrows, and the test list. All fixed.

## What is deliberately not done

- **No note box in the add forms.** They stay one-line quick adds, and a note goes on through Edit.
- **A link can't be followed from the row.** The row's note line is one button, and a link can't
  sit inside one, so a link takes two presses.
- **A plan saved from a tab on old code would drop notes.** The reviewer flagged that a tab still
  running pre-notes code can save a plan without its notes. The `-v3` key keeps that tab out of
  the cache, but not out of the API. The window ends when old tabs are reloaded; it wasn't worth
  versioning the API's plan writes.
- **The domain, the `fitness-api` service and `fitness.db` keep their names.** They belong to the
  home-server deployment.

## Left for after the merge

- Done after the merge (#46): `gh repo rename tracker`; the images published as
  `ghcr.io/johnmathews/tracker` and `tracker-api`; and the design system republished (version 38):
  the two `tracker-wordmark-*.svg` uploads, and 21 cards and pages that were up to six releases
  behind. Before publishing, each live file was compared with every version of it in git history:
  none had been edited on the page.
- The home-server compose template moves to `ghcr.io/johnmathews/tracker` and `tracker-api`, and
  `MAIL_FROM` to "Tracker". Until then the server runs the last `fitness-planner` build.
- Optionally, move `~/projects/fitness-planner` to `~/projects/tracker`.
