# Marker fills, and print in colour

John sent a photo of four boxes filled in with a red marker on paper. Three were circled as "good
enough": an open zigzag with a sharp turn at the top, a solid fill, and a dense diagonal hatch. He
wanted them to replace the squiggles for all three kinds of mark.

## Tracing

Each circled box was cropped from the photo, and its four corners were mapped onto `BOX_PATH`'s
corners with a homography. That straightened the photo's perspective. A straight trace of the
zigzag closed up its gaps, so the two scribbles were redrawn by hand on the 36-unit grid from the
mapped points. They keep the photo's bands and turns, and the strokes stay near the 44px button. The
solid fill is a ragged outline, filled and stroked 1.5 units. The scribbles keep the old 3.5-unit
stroke.

The box is now drawn over the fill. In the photo, the black pen line shows through the marker.

## Which drawing for which kind

A mockup showed two choices, as a week grid on screen and printed black:

- one drawing per kind (solid = great, hatch = partial, zigzag = missed);
- the three drawings mixed, with the pen alone saying the kind.

John picked the mix. `markDrawing(name, date)` hashes the row and the date (FNV-1a) into one of the
three drawings. A day keeps its drawing on every render, in the week and in the Today list, and
stepping its kind changes only the pen. This drops K10's "each kind has its own shape". K15 records
the choice and its cost: someone who can't tell green from red sees only "marked". The accessible
names still say "partly done" and "couldn't do it".

## Print

With the kinds told apart only by colour, a black print would lose them. John: "print should assume
color and look like the app ui does", and then "light mode only … white paper with a transparent
background". The `@media print` block now writes out the light theme's colours for words, boxes and
marks, in either theme. `canvas`, `panel`, `tile` and `highlight` go transparent. The values are
literal, because a dark screen must still print light. `src/styles/__tests__/print.spec.ts` holds
them to `tokens.json`'s light values. This is K16.

## Where it landed

- The app: `MARK_DRAWINGS`, `markDrawing` and `MARK_PENS` (the pens as `text-*`, drawn with
  `currentColor`) in `src/components/ui/day-mark/index.ts`. `DayMark.vue` draws the fill first and
  then the box.
- The cards: the DayMark, WeekGrid, TodayList and NoteMark previews pick a drawing with
  `data-drawing`. The open zigzag is the default. The Cover draws the three drawings with `<use>`.
  The print specimens show the light theme on white.
- The docs: brand.md, decisions.md §4.2, architecture.md §6.2 and §6.7, README, foundations, the
  token usage strings, and the status line in the brand spec.
