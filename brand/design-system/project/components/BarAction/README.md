A tile in the Header for one of its actions: a Lucide icon with its name under it, as big as the week below it.

## Use

- Only in the Header (K47), for its actions: "This week" (`calendar`) beside the week's arrows, and at the right "Edit plan" (`pencil`), "Settings" (`settings`), "Print…" (`printer`) and, last, "Full screen" (`maximize`, or `minimize` and "Exit full screen"; K49, K50). Elsewhere, an action is a Button or an IconButton.
- The icon over its name, centred, `radius-md`, no border. The icon is Lucide outline at the 1.5 stroke in `currentColor`, `aria-hidden="true"`; the name is `label` type (600, sentence case) in `ink`, and it is the accessible name.
- Its sizes follow the screen with the Header (PlannerScreen's `u`): the icon max(26px, 32u), the name max(16px, 17u), 6u between them, 10u × 12u padding, at least max(76px, 96u) wide so a short name doesn't make a thin target. Folded (a phone or an upright iPad, `n`), the icon is 26n and the name 16n, and the tiles share the Header's second row equally.
- **A toggle** (Edit plan; K48): `aria-pressed`. On, it takes the selected segment's fill: `ink`, with the icon and name in `on-ink`. Never the pen.

## States

- Hover: a `tile` fill, 120ms, none under reduced motion. Pressed and hovered keeps the `ink` fill.
- Focus: a solid 2px `focus` outline at 2px offset.
- Pressed (a toggle that is on): `ink` fill, `on-ink` icon and name.
- Every tile is at least 44px in both directions, on every layout.

## You provide

- `label`: the action's name, shown under the icon and used as the accessible name ("Edit plan", "Full screen", "Settings", "Print…").
- The Lucide icon in the default slot.
- `pressed` for a toggle (Edit plan), left out for an ordinary action; the click handler.
