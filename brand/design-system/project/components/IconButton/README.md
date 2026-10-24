A 44px square button that shows one Lucide icon and carries its meaning in an accessible label.

## Use

- For actions whose icon is understood at a glance and repeats often: previous and next week (`chevron-left`, `chevron-right`), settings (`settings`), close (`x`), a row's edit (`pencil`) and remove (`trash-2`) in Edit plan, clear a search, and the Stepper's `minus` and `plus`.
- **Quiet** (the default): no border, `ink` icon, a `tile` fill on hover and while its popover or menu is open (`aria-expanded="true"`).
- **Outlined:** 1px `control-border`, for a button that sits alone in a form or beside fields.
- The icon is 20px, Lucide outline at 1.5px stroke in `currentColor`, `aria-hidden="true"`. The hit area is always 44 × 44px, `radius-md`, on every layout.
- Not for actions people meet once or rarely (sign out, import, copy the plan): use a Button with words. Never an emoji or a Unicode glyph in place of the icon.

## States

- Hover and open: `tile` fill, 120ms, none under reduced motion.
- Focus: a solid 2px `focus` outline at 2px offset.
- Disabled: 40% opacity, only when the action cannot happen at all. A step at its limit (the Stepper) uses `aria-disabled` so focus stays put.

## You provide

- `label` (required): the accessible name, as a verb phrase or the thing it opens: "Previous week", "Next week", "Settings", "Close", "Edit Push-ups", "Remove Push-ups", "Clear search". A row action names its row, since a list of "Remove" buttons is useless out of context. The component sets it as `aria-label`; a button without one must not render.
- `icon`: the Lucide name. `variant` (`quiet`, `outlined`), the click handler, and `aria-expanded` and `aria-controls` when it opens something.
