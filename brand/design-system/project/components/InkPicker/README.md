The setting that chooses the pen: four inks as named dots in a radio group, the chosen one marked by a ring, a check and its name, never by colour alone.

## Use

- A `role="radiogroup"` labelled "Ink" (`label` style), with the hint "The colour of a done mark." in `caption` `ink-secondary`.
- Four options, in this order: **Ink blue** (`ink-blue`, the default), **Forest** (`forest`), **Violet** (`violet`), **Graphite** (`graphite`). Each is a 44px-tall row: a 24px `radius-full` dot in its ink, the name in `body`, and a 20px `check` slot.
- Chosen: `aria-checked="true"`, a 2px `ink` ring at 2px offset around the dot, the `check` icon in `ink`, and the name at weight 600.
- Choosing an ink sets `--pen` for the whole app at once; the theme switches each ink to its dark value by itself.
- Lives in the settings Popover. The rows sit in two columns of two when each row gets at least 152px (`repeat(auto-fill, minmax(152px, 1fr))`), and in one column of four when not, as in the 296px Popover; a name never wraps. It is the one place all four inks show together; everywhere else one `pen` colour shows at a time.
- Never add red or orange inks: `pen` must not be mistaken for `error-ink` or `caution-ink`. Saved accents map as K3 says: blue to Ink blue, green to Forest, purple to Violet, orange to Ink blue.

## States

- Hover: `tile` fill on the row. Focus: a solid 2px `focus` outline at 2px offset around the row.
- Keyboard: one tab stop (the chosen ink); arrow keys move and choose, as in any radio group.
- No disabled state: every ink is always available.

## You provide

- The chosen ink (`v-model`: `ink-blue`, `forest`, `violet` or `graphite`) and the change handler that stores it for the person. Names come from the component, so they match this card everywhere.
