# Chosen drawings, a sunny yellow, bigger marks and type

John looked at the live marker fills (K15) and asked for four changes:

- choose the drawing by pressing, not by a hash of the row and the date;
- a much more cheerful yellow, because the amber read as mustard;
- a zigzag truer to his photo, because the hand-drawn polyline was "too jaggedy";
- boxes 50% bigger, with larger, easier type: "in the gym with a whiteboard", not delicate.

## The drawings, traced from the ink

Last round the scribbles were polylines placed by eye. This time a script lifted the red marker ink
from the photo with an HSV threshold. It bridged the ink across the black pen line and mapped each
box's four corners onto `BOX_PATH`'s with a homography. Then it traced the result with potrace into
filled outlines (`fill-rule: evenodd`, holes for the paper between strokes). The photo's zigzag sits
right of its box and runs about 5 units past it. It was shifted 2 units left and pulled in to 92%
round the centre, so the ink stays near the button. The paths are larger (about 10k characters for
the zigzag), but they are the owner's own strokes.

## The press chooses the drawing (K17)

A mockup offered two orders. John picked "drawing first": great, partial and missed in the zigzag,
then the same three in the solid, then in the hatch, then empty. That is nine marks and then empty.
A food steps green through each drawing. The drawing is now saved with the day:

- **Values:** a mark is its kind with a drawing suffix (`great`, `partial-solid`, `missed-hatch`).
  The plain kind is the zigzag, so every stored day, fixture and older export reads unchanged.
  `markKind` and `markDrawing` read a mark back.
- **API:** schema 4 adds `solid` and `hatch` 7-bit masks beside `partial` and `missed`. A tick, the
  import merge and the export carry them.
- **Export:** version 3. Versions 1 and 2 still import. Two shared fixtures cover a version 3 file
  and a merge where the existing drawing wins.
- **Deploy order:** a tab from before the deploy reads a suffixed mark as empty. It only ever
  writes the one day it presses, so nothing stored is lost.

## Yellow and the band (K18)

No sunny yellow reaches the 3:1 a mark should have on the cream page. The three offered measured
1.5–2.1:1. John chose `#f2b300` (`#f5c518` in dark, above 7:1). The gate now holds `pen-partial` to
1.5:1, so it can't fade further.

The yellow band for today would have swallowed yellow marks, so it became a neutral warm grey,
`#ece7dd` (`#34312c` in dark). On that band the box outline fell just under 3:1, so
`control-border` went one step darker, to `#888175`.

## Bigger marks and type (K19)

- **Marks:** a 60px drawing (a box about 45px across) in a 64px button, in a 76px cell (72px in the
  Today list).
- **Grids:** the minimum widths grew to 748px on a phone and 828px above (856px and 936px in Edit
  plan).
- **Type:** every style went up a step, with `body` at 18/26. Tailwind's `text-base` and `text-sm`
  now follow `body` and `caption`. StatFigure's figure moved to the `title-2` size, 22/28, so it
  stays above `body-large`.

## A stacking bug, found on the way

The card previews drew the box layer at `z-index: 1`, which competed with the sticky name column's
`z-index: 1`. That put boxes over the names at phone width, and it had been there since K15. Each
mark now has `isolation: isolate`.
