# Brand and design system

> Purpose
>
> Where Fitness Planner's brand lives, what its colours, type and marks mean, how the design
> system is kept, and how to change it. Read it before designing or building any screen.

## 1. The direction

The brand is **Notebook**: a paper fitness tracker made durable. It borrows the whiteboard's focus
on now (today and this week get one bold, obvious place), the restraint of Apple Notes, the quality
of a Moleskine without its nostalgia, and the star chart's mark per session made by hand. Two
layers keep the tension apart: **Now** (the week, today's band, the phone's Today list) and
**Record** (months and years, quiet and dense). The reasons, goals, anti-goals and the calls K1–K8
are in the [brand design](specs/2026-10-24-brand-design.md), and the rulings in
[decisions.md](decisions.md) §4.

## 2. The design system

The design system is a claude.ai Design System artifact:
<https://claude.ai/artifact/9pkE17ugXFGGyBirapyCgH>. It holds the brand book, the tokens in a light
and a dark theme, 28 components with live previews and guidelines (Basics, Forms, Overlays, Planner,
Feedback), the cover and the assets. The artifact is private to its owner until it is shared, so
other readers work from the source below. Agents designing for Fitness Planner read its README
first.

Its source lives in this repository, at the same paths the artifact uses:

| Path                                             | Contents                                                                     |
| ------------------------------------------------ | ---------------------------------------------------------------------------- |
| `brand/design-system/SYSTEM.md`                  | The artifact's URL                                                           |
| `brand/design-system/checks.json`                | The gate's settings: required components, extra contrast pairs, banned words |
| `brand/design-system/project/design-system.json` | The index: title, asset records (upload ids)                                 |
| `brand/design-system/project/tokens.json`        | Every colour, type style, space, radius and shadow                           |
| `brand/design-system/project/*.md`               | The brand book: README, `foundations.md`, `voice.md`                         |
| `brand/design-system/project/components/<Name>/` | Each component's `README.md` and `preview.html`                              |
| `brand/design-system/project/assets/`, `fonts/`  | The wordmark and icon SVGs (uploaded), and the self-hosted fonts             |

`scripts/check_design_system.py` is the gate. It measures every contrast pair in both themes, checks
the token shapes and the banned words, and with `--complete` fails when a required component has no
card. `python3 scripts/design_preview.py brand/design-system` builds an offline gallery into the
git-ignored `brand/design-system/preview/`.

## 3. Colour roles

Every colour on screen comes from a role. The ten standard roles carry the screens: `canvas` (the
page), `panel` (dialogs, the popover), `tile` (quiet fills, hover, chips), `line` (hairline rules,
never a control border), `control-border` (inputs, outlined buttons, the empty-day ring), `ink`
(text, icons, the primary button's fill), `on-ink` (text on an `ink` fill), `ink-secondary` (dates,
goals, hints), `error-ink` (form errors) and `focus` (the focus ring). `scrim` dims the page behind a
dialog.

Three project roles each mean one thing, and nothing else may use them:

| Role          | Means                                                                      | Never                      |
| ------------- | -------------------------------------------------------------------------- | -------------------------- |
| `pen`         | Done: a marked day, and a total or figure whose goal is met (with a check) | Links, buttons, decoration |
| `highlight`   | Today: the band down today's column, and the Today list's heading          | Anything but today         |
| `caution-ink` | Over the daily pick, always with words and an underline ("4", "one extra") | Errors                     |

The primary action is `ink`, not a brand colour (K8): one colour for "act", the `pen` for "done".
No meaning rests on colour alone. A met total adds a check, today adds "today" to the name, and
over the pick adds words.

## 4. Inks

The person chooses the pen from four inks in Settings. Each has a light and a dark value, and every
one reaches 4.5:1 as text on `canvas` and `panel` and 3:1 as a dot on `highlight` in its theme. None
is red or orange, so `pen` can't be mistaken for `error-ink` or `caution-ink`.

| Ink                | Light     | Dark      |
| ------------------ | --------- | --------- |
| Ink blue (default) | `#2b4c7e` | `#9db8e8` |
| Forest             | `#2f5d46` | `#8fcbaa` |
| Violet             | `#4b3b7a` | `#b9a9e8` |
| Graphite           | `#3d3d3d` | `#cfcfcf` |

**K3a: the stored setting keeps its old format.** The API, the export file and the shared fixtures
still store the setting as `accent`, any `#rrggbb`, with `#30d158` as the default for missing or
invalid input. `inkFor` in `src/lib/inks.ts` turns it into an ink:

- No saved settings: Ink blue, whatever the default value says.
- A saved accent from before inks (K3): `#0a84ff` and `#ff9f0a` give Ink blue, `#30d158` Forest,
  `#bf5af2` Violet.
- An ink's own light hex gives that ink. Anything else gives Ink blue.

Choosing an ink stores its light hex. `App.vue` sets `--user-pen-light` and `--user-pen-dark` on
`<html>`, and `main.css` picks `--pen` from them per theme.

## 5. Type

Source Serif 4 sets the display date, section titles, the wordmark and notes (italic). Source Sans
3 sets everything else, numbers included, with tabular figures (K4: no monospace). Both are
self-hosted from the Fontsource variable packages, because the CSP allows fonts only from `'self'`.

| Class        | Size and weight                     | Use                                                      |
| ------------ | ----------------------------------- | -------------------------------------------------------- |
| `display`    | 40/44 serif 600 (32/36 below 640px) | The week heading, once per screen                        |
| `title-1`    | 26/32 serif 600                     | Section titles                                           |
| `title-2`    | 20/26 sans 600                      | Dialog, popover and prompt titles, the Today list's date |
| `body-large` | 17/24                               | Summary lines, week totals                               |
| `body`       | 16/24                               | Running text, inputs, buttons, row names                 |
| `caption`    | 14/20                               | Goals, hints, dates                                      |
| `label`      | 14/20 600                           | Field labels, day names, chips                           |
| `note`       | 16/24 serif italic                  | A person's note                                          |

Labels are sentence case, never uppercase with letter-spacing.

## 6. The marks

| Mark          | Look                                                              | Also carried by                            |
| ------------- | ----------------------------------------------------------------- | ------------------------------------------ |
| Done          | A 24px `pen` dot in a 44px button                                 | `aria-pressed="true"`                      |
| Not done      | A 24px ring, 1.5px `control-border`                               | `aria-pressed="false"`                     |
| Today         | The `highlight` band down the column                              | "today" in the name, `aria-current="date"` |
| Over the pick | The day's count in `caution-ink`, underlined, "one extra" beneath | The words                                  |
| Note          | A 10px folded corner in `ink-secondary` (NoteMark)                | "has a note" in the name                   |

Print is black on white in either theme: dots solid black, rings grey, the band gone, "one extra"
kept. Icons are Lucide outline at 1.5px stroke, never Unicode glyphs or emoji. Colour transitions
last 120ms at most and stop under `prefers-reduced-motion`. Nothing celebrates.

## 7. Voice

Plain, calm and brief, in the second person. Small numbers in running sentences are words ("Two of
three. One to go."), and figures stay figures in data ("10 of 12 this week"). No exclamation marks,
no hype, no guilt: facts, then the next step. A confirmation names the thing and uses the verb
("Remove Push-ups?", Remove), never OK or Yes. `voice.md` in the system has the rules and examples,
and its corrected copy is the source for screen strings. The gate rejects the banned words in
`checks.json`. The app's name, "Fitness Planner", is a working name held in one constant,
`APP_NAME` in `src/lib/app.ts`.

## 8. In the app

The tokens reach the app as `src/styles/tokens.css`, generated by `npm run tokens`, and
`src/styles/main.css` maps each role to a Tailwind utility (`bg-canvas`, `text-ink-secondary`).
Components are built from the primitives in `src/components/ui/`, which follow the cards, and the
dev-only `/styleguide` route renders them in both themes and all four inks.
[architecture.md](architecture.md) §6 describes the pipeline, and [development.md](development.md)
§3 the rules for writing components.

## 9. Changing a token

1. Edit `brand/design-system/project/tokens.json`. Change the ink values in `src/lib/inks.ts` too
   when an ink changes: `inks.spec.ts` checks the two agree.
2. Run the gate. It must exit 0 in both themes:

   ```bash
   python3 scripts/check_design_system.py brand/design-system --complete
   ```

3. Regenerate the app's tokens, then run the tests:

   ```bash
   npm run tokens && npm test
   ```

   A new role also needs its `--color-<role>` line in `main.css`'s `@theme inline` block, and a
   print value in its `@media print` block.

4. Publish the changed files to the artifact with `root: brand/design-system`. Send
   `design-system.json` only when its own keys change, and last.

Edits made on the artifact page itself are not in the repository. Read the changed files back
before editing here.

## 10. Adding a component

1. **The card first.** Write `project/components/<Name>/README.md` (the first sentence is the
   summary, then use, states, accessibility and what the consumer provides) and `preview.html`
   (line 1 is the `<!-- @dsCard group="…" height=N -->` marker, then a small page using only
   `var(--token)` and the type classes, in real copy). Add the name to `checks.json`
   `required_components`, run the gate, and render the previews at 375px with the
   design-system skill's `render_previews.mjs`: only the Cover may overflow.
2. **Then the Vue primitive,** in `src/components/ui/<name>/` (`<Name>.vue` and an `index.ts`). Start
   from shadcn-vue on Reka UI wherever the component has behaviour (focus, keyboard, overlays),
   style it with role utilities and type classes only, and add a spec in
   `src/components/ui/__tests__/`.
3. **Then the style guide section,** `src/styleguide/sections/<Name>Section.vue`, with one entry in
   `src/styleguide/sections.ts`, showing every state from the card.
4. Publish the card to the artifact as in §9.
