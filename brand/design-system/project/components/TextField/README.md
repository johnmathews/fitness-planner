A single-line input with its label always visible above it, an optional hint below, and an error that says what happened and what to do.

## Use

- Field: 44px tall, `panel` fill, 1px `control-border`, `radius-sm`, `body` text in `ink`, padding `space-3`. Numbers (sets, reps, weight) add `tabular-nums` and the right `inputmode`.
- Label: `label` style in `ink`, `space-1` above the field. Always visible; a placeholder never stands in for it. Mark optional fields in the label ("Weight (kg, optional)"), not required ones.
- Hint: `caption` in `ink-secondary`, `space-1` below, tied with `aria-describedby` ("At least 10 characters.").
- Error: `caption` in `error-ink` with the 16px `circle-alert` icon and words, tied with `aria-describedby`, the field set to `aria-invalid="true"` and its border to `error-ink`. The message replaces the hint and is announced (`role="alert"`) when it appears after a submit.
- Placeholder text, when used at all, is an example in `ink-secondary` ("e.g. 12"), never an instruction.

## States

- Hover: the border darkens to `ink`. Focus: a solid 2px `focus` outline at 2px offset. Colour changes take 120ms, none under reduced motion.
- Error: as above, until the value changes.
- Disabled: the whole field (label included) at 40% opacity, only when it truly cannot be edited.

## You provide

- `label` (required), `id`, `type`, `autocomplete`, `inputmode`, the value (`v-model`), and optionally `hint` and `error` strings. The component wires `for`, `aria-describedby` and `aria-invalid`.
- Error copy that names the problem and the next step. The app's "The passwords don't match." becomes "The passwords don't match. Type the same password in both fields."; "Wrong username or password." becomes "Wrong username or password. Check both and try again."
