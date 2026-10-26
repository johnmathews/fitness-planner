A small whole number changed one step at a time: a minus button, the value, and a plus button.

## Use

- One 44px-tall group with a 1px `control-border` outline and `radius-md`. The buttons are 44px wide with 20px Lucide `minus` and `plus` icons in `ink`; the value sits between them in the `body-large` size at weight 600 with `tabular-nums`, so the width never jumps. On the Settings page and in dialogs it takes the page's `--set-*` size instead, 60u tall (48px folded), its type at 19u (K51, K55).
- A visible label above in `label` style, tied with `aria-labelledby` on the `role="group"`. The value is an `output` with `aria-live="polite"`, so each step is announced.
- For small bounded counts: **Exercises a day** in Settings (1 to 8), and **Times a week** in the exercise's and the food's dialogs (0 to 7). For numbers people type faster than they tap (weight, reps above 20), use a TextField with `inputmode`.
- Never `pen` for the value; it is a setting, not a result.

## States

- Hover: `tile` fill on the button. Focus: a solid 2px `focus` outline at 2px offset.
- At a limit: that button gets `aria-disabled="true"` (not `disabled`, which would drop keyboard focus mid-press) and its icon fades to 40%; pressing it does nothing.
- Disabled: the whole group at 40% opacity, only when the value truly cannot change.

## You provide

- `label` (required), the value (`v-model`), `min`, `max` and `step` (default 1).
- `lowerLabel` and `raiseLabel` (required): the buttons' accessible names, saying what changes ("Fewer exercises a day", "More exercises a day"). The component never falls back to "minus" and "plus".
