# The Notebook design system, from tokens to enforcement

Engineering run `manual-20261024T124410Z`, Phase 3 and wrap-up, written on 2026-10-24 between about
17:40 and 21:30 CEST. The app moved from ad-hoc Tailwind styling to the approved Notebook brand
(`docs/specs/2026-10-24-brand-design.md`): a published design system, shared Vue primitives, a
living style guide, a rebuilt planner screen, a phone Today view and checks that keep it all in
place. Fourteen work units shipped in six pull requests, #13 to #18.

## 1. What changed

- **The design system (#13, W1–W3).** `brand/design-system/` holds `tokens.json` (the ten standard
  roles, plus `pen`, `highlight`, `caution-ink`, `scrim` and four inks), the brand book, 30 component
  cards and a gate (`scripts/check_design_system.py`). It is published as a claude.ai Design System
  artifact, https://claude.ai/artifact/9pkE17ugXFGGyBirapyCgH, private to the owner until shared.
- **The app on the tokens (#14, W4).** `src/styles/tokens.css` is generated (`npm run tokens`), the
  default Tailwind palette is switched off, and every component paints with the roles. Source Serif
  4 and Source Sans 3 are self-hosted. The accent setting became a choice of four inks.
- **Primitives and the style guide (#15, W5–W7).** shadcn-vue on Reka UI, restyled from the cards:
  Button, IconButton, TextLink, TextField, TextArea, Dialog, ConfirmDialog with `useConfirm()`,
  Popover, SegmentedControl, Switch and Stepper. `/styleguide`, in development only, renders each in
  every state, theme and ink.
- **Screens (#16, W8–W9).** Sign-in, the add forms, the edit dialog, the navbar, Settings, the
  import prompt and the sync banner moved onto the primitives. `window.confirm` is gone, and the app
  name lives in one constant (`src/lib/app.ts`).
- **The planner (#17, W10–W12).** Days are DayMarks: a pen dot or an empty ring. Today has its
  highlight band, the over-pick count reads "4, one extra", and a met total carries a check. Each
  grid is one tab stop with arrow keys (`src/composables/gridNav.ts`). Phones open on a Today list,
  and the week grid's name column is sticky.
- **Enforcement and docs (#18, W13–W14).**
  - Lint rejects unknown or default-palette Tailwind classes, arbitrary colours, `<style>` blocks
    and the template accessibility rules.
  - CI runs the design gate, a "tokens.css is current" check and a Playwright and axe suite.
  - `docs/brand.md` is new; `CLAUDE.md` points UI work at the brand.

## 2. Decisions

- **K1–K8 and K3a** are recorded in `docs/decisions.md` §4. The one that keeps old data working is
  K3a: the stored accent keeps its `#rrggbb` wire format, and `src/lib/inks.ts` maps it to an ink.
  Orange becomes Ink blue, so a pen can never be mistaken for `caution-ink`.
- **P19:** the phone's Today or Week choice belongs to the device (`fitness-planner-view-v1`), like
  the theme.
- **SegmentedControl keeps `aria-pressed`** inside a `role="group"`, which is what Reka's
  ToggleGroup renders (checked in its dist). Pressing the chosen segment never un-presses it.
- **The Popover renders in place.** Reka's popover loops Tab inside itself, which was the real
  cause of F14, not a missing focus-out handler. In place, Tab leaves the panel and closes it.
- **`tokens.css` sits in the `components` layer.** Unlayered, its type classes beat utilities, so
  `caption font-semibold` rendered at weight 400. Layering fixed it and let lint recognise them.
- **Diet has no Picked row.** The WeekGrid card dropped it; `DietSection.spec` now counts 5 rows.

## 3. Review fixes in the wrap-up

A fresh review of the whole run (not one unit) found one real bug. It is confirmed by tests that
failed first, and each fix was removed again to check its test goes red:

- **A confirm question could outlive its context.** With `window.confirm` gone, an open "Replace
  next week's plan?" survived another tab signing in as someone else. Clicking Replace would then
  overwrite that user's plan. It also survived a week change at midnight on Sunday. Now a question
  answers false when its asker goes away, App closes it when the user changes, and Remove and
  Replace check the week before acting.
- **Smaller fixes:** the import summary and the lock-out message write small numbers as words.
  WeekHeader reads the store's clock. TrackerGrid's `showToday` became `scrollToToday`. Settings
  uses ConfirmDialog's `returnFocus`. One `useMediaQuery` composable replaces two copies.
- **A docs audit against the shipped code** fixed 13 stale or missing statements: the storage key
  table, the phone navbar, the CI table, the scripts lists and the brand spec's status line.

## 4. Verified

- **Tests:** 657 unit tests pass, with coverage at 100 / 98.94 / 100 / 100 (floors 100 lines and
  functions, 99 statements, 98 branches). The API suite passes, and `npm run test:e2e` passes 28 of 28. Lint, format, type-check, the build and the design gate exit 0.
- **Each new gate went red on a known-bad input:**
  - `bg-red-500` → `Unknown class detected`.
  - `<div @click>` → `click-events-have-key-events`.
  - Light `ink-secondary` at `#9a9a9a` → the gate's `2.65:1, needs 4.5:1`, and 9 light-theme axe
    failures.
  - A 400px element → `page is 416px wide in a 375px viewport`.
- **Measured in a browser:**
  - A done dot is at least 5.76:1 against canvas and today's band, in all four inks and both themes.
  - At 320px the week arrows are 44×44.
  - A Tab walk at 1280px has 9 stops, down from 77.
  - At 390px the first name cell stays at left 0 when the grid scrolls to Saturday. It was at −108px.
  - Print keeps Diet's heading with its grid in ten generated PDFs.
- **CI:** #13 to #17 were green (`check`, `api`, the Docker builds) before each squash merge. #18
  adds the `e2e` job and merges only once all of them are green.

## 5. What is deliberately not done

- **Notes (K6).** The system designs NoteMark and NoteEditor, and DayMark has a `note` slot, but
  nothing stores a note. The serif italic font and `.note` class ship for that feature.
- **Unit tests that assert styling classes (F22).** About 120 such assertions remain, mostly in the
  primitive specs and `Planner.spec.ts`. Moving them to `data-*` or accessible state is a cleanup of
  its own. No lint rule covers this convention yet.
- **CSP `style-src 'unsafe-inline'`** stays. The bundle sets styles only through the CSSOM, so it is
  probably unnecessary, but removing it needs a check in a real browser first.
- **The final product name.** "Fitness Planner" remains the working name, in one constant.
- **Sharing the artifact.** It is private to the owner; sharing is done from its page.
