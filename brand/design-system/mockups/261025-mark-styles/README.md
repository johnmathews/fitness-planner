# Ticks and faces for the day marks

**Question:** a new setting chooses how a marked day is drawn: the squiggles as now, ticks (a
tick, a tilde, a cross) or faces (happy, so-so, sad), each in the three pens. How are the ticks and
faces drawn, and how does Settings offer the choice? The pens, the box, the squiggles and the rest
of Settings stay as they are.

**Status:** decided (2026-10-25)

**Link:** https://claude.ai/artifact/NhSbpC8H5WdowR944UUDok (private)

## Options

### 1. How the ticks and faces are drawn

- **1A. Marker strokes:** the symbol stroked in the pen at a marker's width (4.5 units, about
  7px), the box drawn over it, the tick's long stroke running past the box. Amber 1.8:1 on the
  page (1.5:1 on today's band). Recommended: it matches the squiggles, and the thick line keeps
  the amber findable.
- **1B. Pen line:** the same symbols at 2.25 units (about 4px), inside the box. Neater, but the
  amber has half the ink.
- **1C. Stamped:** the box filled solid (the solid squiggle), the symbol left in paper. Paper on
  amber is 1.8:1 in light, below the 3:1 a symbol on a fill should reach.

The amber tick-set mark is a tilde, not a dash: a dash would read as an empty day (DayMark card).

### 2. How Settings offers them

Both sit under Theme in Appearance, labelled "Marks", and draw the marks as 1A.

- **2A. Segmented:** a SegmentedControl (Squiggles, Ticks, Faces), with the chosen set's three
  marks beneath. Uses only components the system has.
- **2B. A choice per set:** a radio list with a row per set, each showing its name and three
  marks; the chosen row is outlined in ink. On a phone the marks go under the name. A new
  component, RadioCard, added to the system as a card first. Recommended: all three sets are
  visible, so the person sees what they pick.

## Decision

Over three rounds John picked: 1A marker strokes for ticks and faces; stamped (1C) kept as sets
of their own, so Settings offers five (Squiggles, Ticks, Stamped ticks, Faces, Stamped faces);
2B, a row per set; circles, not tildes, for partly done in the tick sets ("the tildes should be
circles"); and A, Vivid, for brighter dark pens ("brighter and more vibrant"). Recorded as K20 to
K23 in `docs/decisions.md` §4.4.

## Rounds

- **1, 2026-10-25:** three drawing styles and two settings controls. John picked 1A (marker
  strokes) and 2B (a row per set), and asked for stamped (1C) as a set of its own in Settings
  rather than dropping it. 1B and 2A are off the page.
- **2, 2026-10-25:** the five sets together: Squiggles, Ticks, Stamped ticks, Faces, Stamped
  faces, in the week and as RadioCard rows in Settings. John: "It's good, do it as shown, but
  the tildes should be circles. And let's make the colors in dark mode brighter and more vibrant."
- **3, 2026-10-25:** the tick sets' partly done becomes a hand-drawn circle; three sets of
  brighter dark pens beside today's: A Vivid `#3fd273` `#ffc21a` `#ff5c4d` (recommended),
  B Bright `#5cc98a` `#ffcd38` `#ff7466`, C Neon `#2bf07e` `#ffd60a` `#ff4433`. Light unchanged.
