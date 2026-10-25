## Colour

Ten standard roles carry every screen: `canvas` (the page), `panel` (dialogs, popovers, cards), `tile` (quiet fills and hover), `line` (hairline rules, never a control border), `control-border` (inputs, outlined buttons, the day's box), `ink` (text, icons and the primary button's fill), `on-ink`, `ink-secondary` (dates, goals, hints), `error-ink` and `focus`.

Five project roles each mean exactly one thing:

| Role | Means | Never |
| --- | --- | --- |
| `pen` | Great: a day's full squiggle, the year strip's dots and a met total | Links, buttons, decoration |
| `pen-partial` | Partly done: a day's half squiggle | Over the pick, warnings |
| `pen-missed` | Tried and couldn't: a day's cross | Errors |
| `highlight` | Today: the band down today's column | Anything but today |
| `caution-ink` | Over the daily pick, always with words ("one extra") | Errors |

**The three pens** are fixed, like the green, amber and red markers by a whiteboard; nobody picks them. Each mark also has its own shape, so none rests on colour alone. `pen` reaches 4.5:1 as text on `canvas` and `panel`, and all three reach 3:1 as a stroke on `canvas`, `panel`, `tile` and `highlight`, in both themes.

**Print** is black on white in either theme: every mark solid black (its shape tells the three apart), boxes grey, the highlight gone, "one extra" keeps its words.

## Type

**Source Serif 4** for the display date, section titles, the wordmark and notes (italic). **Source Sans 3** for everything else, numbers included, always with `font-variant-numeric: tabular-nums`. Both self-hosted. No monospace.

| Style | Size | Use |
| --- | --- | --- |
| `display` | 40/44 serif 600 (32/36 below 640px) | The week's date, once per screen |
| `title-1` | 26/32 serif 600 | Section titles |
| `title-2` | 20/26 sans 600 | Dialog titles |
| `body-large` | 17/24 | The summary line under a section title |
| `body` | 16/24 | Running text, inputs, buttons, row names |
| `caption` | 14/20 | Goals, hints, dates in `ink-secondary` |
| `label` | 14/20 600 | Field labels, day initials, chips. Sentence case. |
| `note` | 16/24 serif italic | A person's note |

## The marks

- **Empty:** the box, drawn by hand in `control-border`, about 30px across, centred in a cell at least 44px tall.
- **Great:** a `pen` squiggle filling the box. **Partial:** a `pen-partial` squiggle filling its lower half. **Missed:** a `pen-missed` cross. Each runs a little past the box, as a quick hand does, and each counts towards the week.
- **A press** steps an exercise's day from empty to great, partial, missed and back to empty; a food is eaten or not, so it goes from empty to great and back.
- **Today:** the `highlight` band down the column, and "today" in the accessible name.
- **Note:** a small `ink-secondary` mark in the cell's top-right corner; "has a note" in the accessible name.
- **Over the pick:** the day's count in `caution-ink`, underlined, with "one extra" beneath.

## Shape and depth

Hairline `line` rules, almost no shadow. Radius `radius-sm` 4px (fields, tiles, chips), `radius-md` 6px (buttons), `radius-lg` 10px (panels), `radius-full` (the Switch, the year strip); a day mark is drawn by hand, with no radius token. `shadow-overlay` on dialogs and the popover in light; none in dark. Spacing on a 4px base, `space-1` to `space-16`.

## Focus and motion

Every interactive element shows a solid 2px `focus` outline at 2px offset, never clipped. Colour transitions last 120ms at most and stop under `prefers-reduced-motion`. Nothing celebrates.

## Icons

Lucide outline icons at 1.5px stroke, 20px in buttons and 16px beside text, in `currentColor`. An icon-only button always has an accessible label and a 44px hit area.
