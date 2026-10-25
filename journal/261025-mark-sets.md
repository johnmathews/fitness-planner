# Mark sets: ticks and faces, and brighter dark pens

John asked for a choice in Settings between kinds of squiggle, each still green, amber and red: a
"ticks, crosses, medium" set and a "happy, sad, middle face" set.

## Decided on a mockup first

The second question to go through the mockup workflow
(`brand/design-system/mockups/261025-mark-styles`, private artifact
<https://claude.ai/artifact/NhSbpC8H5WdowR944UUDok>). Three rounds:

1. Three ways to draw the symbols (marker strokes, a thin pen line, stamped) and two settings
   controls (a SegmentedControl with the chosen set beneath, or a row per set). John picked
   marker strokes and a row per set, and asked to keep stamped as a set of its own.
2. The five sets together. John: "do it as shown, but the tildes should be circles. And let's make
   the colors in dark mode brighter and more vibrant."
3. Circles, and three sets of dark pens. John picked Vivid.

Recorded as K20 to K23 in `docs/decisions.md` §4.4. The amber "medium" tick mark was a tilde, not
a dash, because the DayMark card says an empty day is never a dash; the circle replaced it.

## What changed

- **Tokens:** dark `pen` `#3fd273`, `pen-partial` `#ffc21a`, `pen-missed` `#ff5c4d`. Light is
  unchanged. The gate measures three new pairs, `canvas` on each pen, for the stamped symbols;
  paper on light amber is 1.8:1 and held to 1.5:1 (K23).
- **The setting:** `markSet` in `fitness-planner-settings-v1`, the device's like the theme, so the
  API, export and other devices are untouched. `parseSettings` falls back to `squiggles`.
- **Drawing:** `DayMarkDrawing` is the mark without its button, so the Marks setting can show each
  set inside a radio row (a button inside a button is invalid). `markLook` and `MARK_SYMBOLS` give
  the symbols; DayMark, TrackerGrid, TrackerRow and TodayList take the set as a prop.
- **Pressing:** `cycleFor(item, set)`. A symbol set steps the plain kinds once; a squiggle drawing
  already stored steps on from its kind (`great-solid` → `partial`), so switching sets mid-week
  never strands a day.
- **Print:** `canvas` is transparent on paper, so a stamped symbol would have vanished. A print
  rule gives it the light canvas.
- **RadioCard:** a new component, card first (README, preview, `checks.json`), then the Vue
  primitive on Reka's RadioGroup, its spec and a style guide section. SegmentedControl's card now
  points to it for four or more options.
- **The gate scripts** were behind the skill's copies (no `SCRIPT_VERSION`); both were updated, and
  the regenerated `tokens.css` was byte-identical before the token change.

## Caught on the way

The first cut had TrackerRow read the planner store. The unit tests passed, but the style guide
mounts TrackerGrid with no Pinia and the Playwright run failed on every style guide page. The set
now comes down as a prop from ExerciseGrid and DietSection, as the daily pick does for TodayList.

## Seeing it locally, with demo data

John viewed the branch on a local stack before any push and wants that to be the normal loop:
quicker than CI, and fast iteration matters most. The design-system and engineering-team skills
now say so (bring the stack up before commit or push, keep the login and data, seed demo data).

This repo had no seed, so a fresh account opened on empty weeks. `fp-admin seed-demo` (the API's
`seed.py`) adds one: a confirmed `demo@example.com` / `demo-password` account with three weeks of
plans and marks ending today. It builds an export file and runs it through `parse_export` and
`import_data`, the same path as Settings → Import, so it inherits the merge rules for free: a
week's plan only where none exists, empty days only, nothing overwritten, and a second run adds
nothing. It refuses unless `PUBLIC_ORIGIN` is an `http://localhost` or `127.0.0.1` origin with
`COOKIE_SECURE=false`, so it can't reach a deployed planner. The demo uses the default plan's ids
(`pl` is Pull-ups), so seeding an account that already has that plan marks the right rows.
