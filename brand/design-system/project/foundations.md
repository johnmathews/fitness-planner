## Colour

Ten standard roles carry every screen: `canvas` (the page), `panel` (dialogs, popovers, cards), `tile` (quiet fills and hover), `line` (hairline rules, never a control border), `control-border` (inputs, outlined buttons, the day's box), `ink` (text, icons and the primary button's fill), `on-ink`, `ink-secondary` (dates, goals, hints), `error-ink` and `focus`.

Three project roles each mean exactly one thing:

| Role | Means | Never |
| --- | --- | --- |
| `pen` | Done: the session squiggle and a met total | Links, buttons, decoration |
| `highlight` | Today: the band down today's column | Anything but today |
| `caution-ink` | Over the daily pick, always with words ("one extra") | Errors |

**Inks.** The person picks the pen: `ink-blue` (default), `forest`, `violet` or `graphite`. Each reaches 4.5:1 as text on `canvas` and `panel` and 3:1 as a squiggle on `highlight`, in its theme. One pen colour shows at a time.

**Print** is black on white in either theme: squiggles solid black, boxes grey, the highlight gone, "one extra" keeps its words.

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

- **Done:** a `pen` marker squiggle filling the day's box, centred in a cell at least 44px tall.
- **Not done:** the empty box, drawn by hand in `control-border`, about 30px across.
- **Today:** the `highlight` band down the column, and "today" in the accessible name.
- **Note:** a small `ink-secondary` mark in the cell's top-right corner; "has a note" in the accessible name.
- **Over the pick:** the day's count in `caution-ink`, underlined, with "one extra" beneath.

## Shape and depth

Hairline `line` rules, almost no shadow. Radius `radius-sm` 4px (fields, tiles, chips), `radius-md` 6px (buttons), `radius-lg` 10px (panels), `radius-full` (the ink dots, the Switch, the year strip); a day mark is drawn by hand, with no radius token. `shadow-overlay` on dialogs and the popover in light; none in dark. Spacing on a 4px base, `space-1` to `space-16`.

## Focus and motion

Every interactive element shows a solid 2px `focus` outline at 2px offset, never clipped. Colour transitions last 120ms at most and stop under `prefers-reduced-motion`. Nothing celebrates.

## Icons

Lucide outline icons at 1.5px stroke, 20px in buttons and 16px beside text, in `currentColor`. An icon-only button always has an accessible label and a 44px hit area.
