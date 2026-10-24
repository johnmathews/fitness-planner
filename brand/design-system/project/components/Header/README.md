The app bar: the wordmark on the left, and on the right the week navigation and the settings button.

## Use

- `canvas` background with a 1px `line` rule below; no shadow, no blur. At least 56px tall; padding `space-6` at the sides on desktop, `space-4` and `space-2` on the phone.
- **Wordmark:** the BrandMark outline SVG, 20px tall, `fill: var(--ink)` so it follows the theme. Below 480px wide it gives way to the "FP" monogram.
- **Week navigation:** a `nav` labelled "Week" holding two quiet IconButtons, "Previous week" (`chevron-left`) and "Next week" (`chevron-right`), around the week label ("19–25 October") in `body` size at weight 600, `tabular-nums`, with a fixed minimum width so the arrows never jump. The label is `aria-live="polite"`, so a change of week is announced.
- **This week:** a quiet Button after the arrows, sm (36px) on desktop, md (44px) below 640px, shown only while another week is on screen.
- **Settings:** a quiet IconButton (`settings`) that opens the settings Popover; it keeps the `tile` fill while open (`aria-expanded="true"`). The "Edit plan" Switch, when present, sits before it on desktop.
- The bar holds no heading. The page's `<h1>` is the week date, set in `display` by the page under the bar, above the SectionHeaders; the week label in the bar is plain text.
- Never `pen`, never `highlight` in the bar. Nothing in it prints.

## States

- Buttons follow IconButton and Button: `tile` on hover and while open, a 2px `focus` outline at 2px offset.
- Phone (375px): monogram, arrows, label and settings on one row; "This week", when shown, comes after Settings in the markup and the tab order and wraps to a second row, right-aligned. Every target 44px. Nothing scrolls sideways down to 320px.

## You provide

- The week label for the week on screen, and whether it is this week (to hide "This week").
- Handlers for previous, next and this week, and the settings Popover to open.
- The product name comes from the one place the code holds it; the bar never hard-codes it.
