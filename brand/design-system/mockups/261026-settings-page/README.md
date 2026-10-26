# A Settings page like the week

**Question:** the Settings page is a narrow 576px column at the system's small fixed sizes, under
a bar and above a week that are now full width and big. How does it take the week's language?
Its contents, order and copy stay as they are.

**Status:** decided (2026-10-26)

**Link:** https://claude.ai/artifact/6GwJXBBdmTUdSYEqzMdrdi (private)

The page is live (`settings.js`, `settings.css`). `marks.js` holds the SettingsPage card's mark
pictures, generated from its `preview.html`; `icons.js` holds the Lucide icons and the wordmark.
`try.html` shows the page full size, with a switch for the layout and the theme.

## Options

Both: the page's 48u margins; every size from `u`; the title in the serif at 40u like
"Exercises"; headings at 27u like the row names; labels and text at 19u; controls 60u tall;
marks 60u. Folded, one column at the system's sizes.

- **A. Rows like the week.** Full width. Each section is a row: its heading in a 320u left
  column like the week's names, its settings to the right, hairlines between rows. The mark sets
  are tiles, three to a row. Recommended: it reads like the week and uses the width.
- **B. One wider column.** The page as now at the same big sizes, 880u wide and centred, with
  the mark sets as rows.

## Decision

John picked **A**, rows like the week, on 2026-10-26 (K51 in
[decisions.md](../../../../docs/decisions.md)). The ask was "it is needlessly narrow. lets make
its design language fit with the rest of the app".

## Rounds

- **1, 2026-10-26:** A and B, beside the shipped page.
- **2, 2026-10-26:** from John's notes on the built page: no bar on the Settings page (K52), and
  the Your data and Account buttons beside their text, as the Stepper sits beside its label
  (K53).
