The product's name as a mark: the "Fitness Planner" wordmark in Source Serif 4 600, and an "FP" monogram for small spaces. There is no drawn logo.

## Use

- **Wordmark:** the outlined path from `assets/Wordmark/fitness-planner-wordmark-ink.svg`, inlined with `fill: var(--ink)` so it follows the theme. 32px tall on the sign-in card and the cover, 20px in the Header. Never below 16px tall.
- Where an inline SVG is impossible (an `<img>`, a document), use the asset files: `fitness-planner-wordmark-ink.svg` (`ink` light value) on light grounds, `fitness-planner-wordmark-light.svg` (`ink` dark value) on dark ones.
- **Monogram:** "FP" set live in `var(--font-serif)` at 600, in `ink`. 20px in the phone Header, where the wordmark does not fit. On an `ink` square with `on-ink` letters and `radius-md`, it is the app icon and favicon.
- Clear space: at least the height of the capital "F" on every side. Nothing touches it.
- Only `ink` (or `on-ink` on an `ink` fill). Never `pen`, `highlight`, a gradient, a shadow, an outline or a tagline beside it. Never stretch, re-letter or redraw it.
- "Fitness Planner" is the working name. The name lives in one place in the code, and the wordmark asset is regenerated from type by `scripts/wordmark.py` when it changes.

## States

- None: the mark is not interactive. When it links home, the link carries the focus ring (TextLink rules, without the underline).

## You provide

- `variant` (`wordmark`, `monogram`) and `size`. The component sets `role="img"` and the accessible name "Fitness Planner" from the app's one name string.
