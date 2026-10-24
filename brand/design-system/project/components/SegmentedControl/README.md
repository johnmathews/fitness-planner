A row of two or three toggle buttons, exactly one chosen, for a setting whose options all fit on screen at once.

## Use

- A 1px `control-border` outline with `radius-md`, 44px tall; each segment `label` style in `ink`, padding `space-4`, `radius-sm`.
- The chosen segment is filled `ink` with `on-ink` text (the same "act" colour as the primary Button), and carries `aria-pressed="true"`. Never `pen`: pen means done.
- A visible label above in `label` style, tied with `aria-labelledby` on the `role="group"`.
- Real uses: **Theme** (System, Light, Dark; System first, as the default) and **Reps count** (Per set, Each side, per set).
- At most three short options. Four or more, or long labels, take a list of radio buttons. A single on/off choice is a Switch.

## States

- Hover on an unchosen segment: `tile` fill. Colour changes take 120ms, none under reduced motion.
- Focus: a solid 2px `focus` outline at 2px offset on the segment, drawn above its neighbours.
- Disabled: the whole control at 40% opacity, only when the setting cannot change.
- On a phone the control may wrap onto two lines rather than shrink its type.

## You provide

- `label` (required), the options as `{ value, label }`, and the chosen value (`v-model`).
- Option labels in sentence case. The app's "per set" and "each side, per set" become "Per set" and "Each side, per set": sentence case, same meaning.
