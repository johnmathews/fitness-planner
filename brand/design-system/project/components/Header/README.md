The app bar: the wordmark on the left, the week navigation at the centre, and the settings button on the right.

## Use

- `canvas` background with a 1px `line` rule below; no shadow, no blur. At least 56px tall; padding `space-6` at the sides on desktop, `space-4` and `space-2` on the phone.
- **Wordmark:** the BrandMark outline SVG, 20px tall, `fill: var(--ink)` so it follows the theme. Below 480px wide it gives way to the "FP" monogram.
- **Layout:** three columns, `1fr auto 1fr`, so the week navigation sits at the centre of the bar whatever the two sides hold: the wordmark at the start of the first, the controls at the end of the third.
- **Week navigation:** a `nav` labelled "Week" holding two quiet IconButtons, "Previous week" (`chevron-left`) and "Next week" (`chevron-right`), around the week label ("19–25 October") in `body` size at weight 600, `tabular-nums`, with a fixed minimum width so the arrows never jump. The label is `aria-live="polite"`, so a change of week is announced.
- **This week:** a quiet Button in the right-hand controls, sm (36px) on desktop, md (44px) below 640px, shown only while another week is on screen.
- **Settings:** a quiet IconButton (`settings`) that opens the SettingsPage. The "Edit plan" Switch, when present, sits before it on desktop. On the SettingsPage the bar holds only the wordmark.
- The bar holds no heading. The page's `<h1>` is the week date, set in `display` by the page under the bar, above the SectionHeaders; the week label in the bar is plain text.
- Never `pen`, never `highlight` in the bar. Nothing in it prints.

## States

- Buttons follow IconButton and Button: `tile` on hover and while open, a 2px `focus` outline at 2px offset.
- Phone (375px): monogram, the centred arrows and label, and Settings on one row; the "Edit plan" Switch and "This week", when shown, take a second row, right-aligned. Every target 44px. Nothing scrolls sideways down to 320px.

## You provide

- The week label for the week on screen, and whether it is this week (to hide "This week").
- Handlers for previous, next and this week, and the way to the SettingsPage.
- The product name comes from the one place the code holds it; the bar never hard-codes it.
