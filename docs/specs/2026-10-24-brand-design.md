# Brand design: Notebook

> Purpose
>
> The approved brand direction for Fitness Planner, and the rules the design system turns into
> tokens and components. Direction B ("Notebook") was chosen on 2026-10-24 from three mocked-up
> directions (https://claude.ai/artifact/QVRjZWL2C6ymQrTcVvgTeJ). Nothing gets built before this
> document is approved; the calls in §10 are open to veto by ID.
>
> **Status:** the pen and the inks here (one pen, four inks to choose from, K3) are superseded by
> three fixed pens, one per kind of mark ([decisions.md](../decisions.md) §4.1, K9–K13;
> [brand.md](../brand.md) §4) (2026-10-25). The rest stands.

**Status:** approved 2026-10-24 (calls K1–K8 accepted; see [decisions](../decisions.md)).

## 1. Intent

In the owner's words:

> Simple and durable. Reliable. A long-term pursuit that needs consistency across years. "Just
> another week" of incremental gains. Engaging, but not gimmicky: there is no substitute for the
> hard work of showing up and sweating, and a tool shouldn't pretend otherwise or distract from
> that reality. Professional: a tool a personal trainer could recommend, and use themselves during
> client sessions. (Almost) as simple as a star chart or a paper fitness tracker.

Three rules for success: **Have fun. Avoid injury. Don't stop.**

## 2. References, and what each one lends

| Reference                  | Borrowed                                                                                     | Not borrowed                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Whiteboard                 | Rooted in now: today and this week get one bold, obvious place                               | The busy, marker-heavy look (direction A, rejected as too busy for years of use) |
| Apple Notes                | Restraint, dependability, deliberate design; chronological order and plain search are enough | Its literal look: system blue, stock iOS greys                                   |
| Moleskine                  | Durable quality: well bound, does not fall apart, pleasant to write on                       | Nostalgia, faux paper, leather, handwriting fonts                                |
| Paper tracker / star chart | A mark per session, made by hand, read at a glance                                           | Stickers, rewards, gold stars                                                    |

The tension between the whiteboard (transient, now) and the notebook (permanent, years) resolves
into two layers rather than an average of the two.

## 3. The two layers

1. **Now**: today and this week. The week heading, the grid, today's highlighter band and the
   phone's Today list. One obvious thing to do; nothing archival competes with it.
2. **Record**: months and years, notes and search. Quiet and dense. Consistency shows as an
   unbroken run of ordinary weeks; a week off shows as an empty ring, plainly, without comment.

## 4. Direction rules

### 4.1 Colour

Standard roles (same names in every project), starting values. The gate measures every pair in
both themes before anything ships; a value that misses moves one step and the change is recorded.

| Role             | Light           | Dark      | Use                                          |
| ---------------- | --------------- | --------- | -------------------------------------------- |
| `canvas`         | `#FAF8F3` paper | `#1B1A18` | Page ground                                  |
| `panel`          | `#FFFEFB`       | `#23221F` | Dialogs, popovers, cards                     |
| `tile`           | `#F1EDE4`       | `#2B2926` | Quiet fills, hover, the note background      |
| `line`           | `#E4DFD5`       | `#3A3733` | Rules between rows; never a control border   |
| `control-border` | `#8C8579`       | `#8F887C` | Inputs, outlined buttons, the empty-day ring |
| `ink`            | `#1F1D1A`       | `#EDE9E2` | Text, icons, the primary button's fill       |
| `on-ink`         | `#FAF8F3`       | `#1B1A18` | Text on an `ink` fill                        |
| `ink-secondary`  | `#5F5A52`       | `#B3AC9F` | Captions, dates, goals, hints                |
| `error-ink`      | `#9F1D1D`       | `#F08A7E` | Form errors, always with an icon and words   |
| `focus`          | `#2B4C7E`       | `#9DB8E8` | Solid 2px outline at 2px offset              |

Project roles:

| Role          | Light          | Dark                       | Means                                                | Never                      |
| ------------- | -------------- | -------------------------- | ---------------------------------------------------- | -------------------------- |
| `pen`         | the chosen ink | the chosen ink, dark value | Done: the session dot, met totals                    | Decoration, links, buttons |
| `highlight`   | `#F6EBB8`      | `#3B3524`                  | Today                                                | Anything but today         |
| `caution-ink` | `#A0461A`      | `#E3A06B`                  | Over the daily pick, always with words ("one extra") | Errors                     |

**Inks** (the accent setting becomes a choice of pen): Ink blue `#2B4C7E` / `#9DB8E8` (default),
Forest `#2F5D46` / `#8FCBAA`, Violet `#4B3B7A` / `#B9A9E8`, Graphite `#3D3D3D` / `#CFCFCF`. Every
ink must reach 3:1 as a dot on `canvas` and `highlight`, and 4.5:1 as text on `canvas`, in its
theme. No ink may be red or orange, so `pen` can never be mistaken for `error-ink` or
`caution-ink`.

**Print** stays black on white: dots print solid black, rings grey, the highlight disappears and
"one extra" keeps its words.

### 4.2 Type

- **Source Serif 4** for the display date, section titles, the wordmark and notes (italic).
- **Source Sans 3** for everything else, numbers included, with `tabular-nums`. No monospace.
- Both self-hosted (Fontsource variable packages); the CSP blocks Google Fonts.
- Styles: `display` 40/44 serif 600 (below 640px, 32/36); `title-1` 26/32 serif 600; `title-2`
  20/26 sans 600; `body-large` 17/24; `body` 16/24; `caption` 14/20; `label` 14/20 600;
  `note` 16/24 serif italic. No uppercase letter-spaced labels.

### 4.3 Shape and depth

Hairline rules, almost no shadow. Radius 4 (fields, tiles), 6 (buttons), 10 (panels), full (dots).
One soft shadow for overlays in light; none in dark. Spacing on a 4px base.

### 4.4 The marks

- **Done**: a filled `pen` dot, 24px, centred in a cell at least 44px tall.
- **Not done**: a 1.5px `control-border` ring of the same size.
- **Today**: the `highlight` band down the column, plus "Today" in the accessible name.
- **Note**: a small mark in the cell's corner, `ink-secondary`; "has a note" in the accessible
  name. The final form is settled in its component card.
- **Over the pick**: the day's count in `caution-ink`, underlined, with "one extra" beneath.

### 4.5 Restraint

- Motion: colour transitions of 120ms at most, none under `prefers-reduced-motion`. No celebration.
- Icons: Lucide outline at 1.5px stroke, replacing the Unicode glyphs.
- One `pen` colour on screen at a time. One strong number per section.

## 5. Voice

Plain, calm and brief, in the second person. Small numbers as words ("Two of three. One to go.").
No exclamation marks, no hype ("crushed it", "beast mode"), no guilt ("You missed 3 days").
Facts, then the next step. Notes belong to the user and are never prompted for.

## 6. Name

"Fitness Planner" is the working name; the scope is fitness, wider than training, since it
includes diet. The final name is open. The wordmark is set in Source Serif 4 600, and the name
lives in one place in the code so a rename touches one string.

## 7. What the design system contains

The component list is the full scope.

- **Basics:** Button (primary, secondary, quiet), IconButton, TextLink, Header (the app bar with
  wordmark and week navigation), Panel, BrandMark, Cover.
- **Forms:** TextField (visible label, hint, error), TextArea, SegmentedControl, Switch, Stepper,
  InkPicker, SearchField.
- **Overlays:** Dialog, ConfirmDialog, Popover (Settings).
- **Planner:** DayMark, WeekGrid (with the today band, totals and the picked row), SectionHeader
  with StatFigure, Chip (sets × reps detail), TodayList (phone), NoteMark, NoteEditor, YearStrip,
  SearchResult.
- **Feedback:** InlineMessage (error, caution, success, info), Banner (sync status).

## 8. Non-goals

- Dashboards, charts and analytics beyond the YearStrip.
- Streaks, badges, points, social features.
- Theming beyond the four inks and light, dark and system.
- Email and marketing pages; the app sends no email.

## 9. Anti-goals

- Busy (direction A's verdict) or generic (direction C's verdict).
- A template, or the look of generated "AI design".
- Gimmicks: confetti, streak flames, badges, motivational slogans.
- Fake paper texture, handwriting fonts, skeuomorphic binding.

## 10. Calls made on the owner's behalf

Each is open to veto by ID.

- **K1** Component layer: shadcn-vue (owned source on Reka UI), restyled to the tokens. The
  evaluation's research favoured hand-rolled primitives; shadcn-vue wins on tested keyboard and
  focus behaviour for Dialog, Popover and Stepper, at about 67 KB gzipped.
- **K2** The living style guide is two things: the published claude.ai Design System artifact
  (the brand book) and a dev-only `/styleguide` route that renders the real Vue components in
  both themes and all four inks, and is the target for the accessibility and visual checks.
- **K3** Inks replace the four iOS accents. Existing settings map blue → Ink blue, green →
  Forest, purple → Violet, orange → Ink blue.
- **K4** No monospace: numbers use Source Sans 3 with tabular figures.
- **K5** The phone gets a Today list as its first view, and the week grid gains a sticky name
  column. This reverses "the grid scrolls sideways, as designed" in `docs/architecture.md` §5.
- **K6** Notes on an exercise or a set are a separate feature unit, built after the system; the
  system supplies NoteMark and NoteEditor so the feature has a home.
- **K7** "Have fun. Avoid injury. Don't stop." stay principles in this document. They do not
  appear in the UI.
- **K8** The primary action colour is `ink`, not a brand blue: one colour for "act", the `pen`
  for "done".

## 11. Constraints

- WCAG 2.2 AA in light and dark, for every ink: text 4.5:1, controls and marks 3:1.
- Touch targets of at least 44px on the phone layout; usable down to 320px.
- Fonts self-hosted under `default-src 'self'`.
- Print stays black on white in either theme.
- The theme and the ink belong to the device and the person respectively, as today
  (`docs/decisions.md` P3).
