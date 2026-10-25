An on/off control that takes effect at once, with its label inside the same 44px button.

## Use

- A `role="switch"` button holding the label (`body`, `ink`) and a 40 × 24px track with `radius-full`. The whole row is the target: 44px tall, padding `space-2`, `radius-md`.
- Off: 1px `control-border` track, `ink-secondary` thumb at the left. On: `ink` track, `on-ink` thumb at the right. The thumb's position says the state as much as the fill; never `pen` (pen means done).
- For a mode or setting that changes the screen straight away, such as **Edit plan** in the Header, which shows the plan's editing controls.
- Not for a choice between named options (SegmentedControl), and not inside a form that needs a Save: use a checkbox there.
- The label names the thing that is on, not the action: "Edit plan", not "Turn on editing". On a phone it may shorten ("Edit") while the accessible name stays "Edit plan".

## States

- Hover: `tile` fill on the row. Focus: a solid 2px `focus` outline at 2px offset around the row.
- Only colours transition (120ms, none under reduced motion); the thumb moves without animation.
- Disabled: 40% opacity, only when the setting truly cannot change.

## You provide

- `label` (required, also the accessible name), the state (`v-model`, reflected in `aria-checked`), and optionally a shorter visible label for narrow screens.
