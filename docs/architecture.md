# Architecture

> Purpose
>
> How the planner is put together: the component tree, the Pinia stores, how data syncs with the
> API and what stays in `localStorage`, the decisions that depart from the design prototype, and
> how the design system reaches the screen.

## 1. Overview

A Vue 3 SPA with accounts. The API service in `api/` ([api.md](api.md)) holds each user's data, and
the app syncs with it through the same origin (§7). Two Pinia stores hold what the app shows:
`planner` (exercise plans, the log, the visible week, settings, the mode) and `diet` (food plans and
their log), which takes its week from `planner`. Two more run the account: `session` (who is signed
in) and `sync` (the per-user cache, the outbox of unsent writes, and reads). Both data stores track
the same thing, a tick per day against a weekly goal, through the pure helpers in
`src/lib/tracker.ts`. The same module words the counts: `pickedCount` gives each Picked cell its
tone (at the pick, over it with "one extra", under it, or a day to come shown as an en dash), and
`todaySummary` writes the Today list's line ("Two of three. One to go."). `src/lib/words.ts` writes
small counts as words: `numberWord` ("two", or "Two" to open a sentence, figures from 11 up) and
`countOf` ("one change", "two changes"). `src/lib/plans.ts` decides which week's plan a week
shows; `src/lib/dates.ts` holds the week maths (Monday of a week, `YYYY-MM-DD` keys and back,
labels, `DAY_NAMES`); `src/lib/theme.ts` holds the theme names and `isDark`.

Every screen is built from the primitives in `src/components/ui/` (§6.3), which follow the design
system's cards ([brand.md](brand.md)). `TrackerGrid` and `TrackerRow` (on the `DayMark`, `Chip`,
`Stepper` and `IconButton` primitives) take props, emit events, and serve both sections.
`TrackerGrid` runs the grid's keyboard model (`useGridNav`, §6.5). `TrackerRow` asks the
`ConfirmDialog` (through `useConfirm`, §6.4) before emitting `remove`, and names where focus goes
once the row has gone. `ExerciseGrid` and `DietSection` wire them to their store. `AddExerciseForm` and `EditExerciseDialog` share their field
state and input cleaning through `useExerciseForm` (`src/composables/exerciseForm.ts`) and the
`PerSideToggle` segmented control. `src/lib/problems.ts` turns a sign-in, link or sign-out refusal
into a sentence for the forms; `src/composables/importSummary.ts` says what an import would add,
for Settings → Import… and the first-login prompt.

```
App.vue                 picks the screen (link, planner or sign-in), the pen variables (inkFor),
│                       .dark class, clock refresh, sync triggers (focus, visibility, online, minute
│                       tick, storage), the phone's Today | Week switch, and the one ConfirmHost
├── PasswordForm.vue    an invite or reset link (#/invite/<t>, #/reset/<t>): choose a password
├── LoginForm.vue       username and password; explains refusals; notes an ended session
│   (both inside AuthCard.vue: a centred Panel with the BrandMark)
├── AppNavbar.vue       the Header card: Skip to today, BrandMark, ‹ › and the week, This week,
│   │                   the Edit plan Switch, Settings and Print…
│   └── SettingsPopover.vue   Popover: theme (SegmentedControl), Ink (InkPicker), Exercises a day
│                             (Stepper), Show weekly totals (Switch), Export and Import… (see §4),
│                             who is signed in, Sign out
├── SyncStatus.vue      loading, offline and conflict Banners above the planner
├── ImportPrompt.vue    this browser's log from before accounts, offered once (§7)
├── TodayList.vue       phones only (below 640px), the first view: today's exercises and foods,
│                       one DayMark each, "Two of three. One to go."; a Today | Week switch above
│                       it (usePhoneView, src/composables/phoneView.ts) leads to the week below
├── WeekHeader.vue      the page's h1, the week ("19–25 October"); in config mode "Copy plan to
│                       next week" and a note when the plan is carried over
├── ExerciseGrid.vue    the Exercises section: SectionHeader ("10 of 12 this week" StatFigure)
│   ├── TrackerGrid.vue a <table> (WeekGrid card): day header, one TrackerRow per item, today's
│   │   │               highlight band, and the Picked row ("4", "one extra" over the pick)
│   │   └── TrackerRow.vue  name and chips; 7 × DayMark; "3 of 4" total; in config
│   │                       mode the goal Stepper and edit/remove IconButtons in the row header
│   ├── AddExerciseForm.vue config mode only: name, sets, Measure (Reps or Time), reps or
│   │                       seconds, PerSideToggle, weight (kg)
│   └── EditExerciseDialog.vue  Dialog: the add form's fields, then Times a week (the goal)
└── DietSection.vue     the Food section: SectionHeader ("2 of 4 goals met"), kept with its grid
    ├── TrackerGrid.vue wired to diet: no chips and no Picked row (foods have no daily pick)
    └── AddFoodForm.vue config mode only: name, Add food
```

## 2. Weekly plans

Each week has its own **plan**: the exercises (with sets, reps or a duration, per-side, weight and goal) and the
foods (with goals). Ticks live in a separate **log**, keyed by week and item id.

- **Carry forward.** A week without a plan of its own shows the plan of the latest earlier week that
  has one (`planSource` in `src/lib/plans.ts`); weeks before the first plan show the earliest one,
  and with no plans at all the stores show the defaults. In config mode the header says which week
  the plan comes from, naming the exercise and food sources separately when they differ.
- **A week gets its own plan when it first changes**, ticks included: the store copies what the week
  shows into `plans[week]` and edits that copy (`own()`). Until then, an unplanned week follows its
  source, so changing this week's plan also changes the weeks ahead that haven't been touched.
- **Copy plan to next week** (config mode) copies the visible week's exercises and foods into the
  next week, replacing its plan after a confirmation if it had one, then shows that week.
- Items keep their ids when copied, so a week's ticks stay attached to the same exercise or food.
  Removing an item from one week leaves weeks with their own plan alone; its ticks stay in the log,
  uncounted.

## 3. Stores

`usePlannerStore` is a setup store.

| State                 | Kept by                                    | Notes                                                            |
| --------------------- | ------------------------------------------ | ---------------------------------------------------------------- |
| `plans`               | the sync store: server and per-user cache  | week → `{ id, name, sets?, reps, duration?, perSide?, weight?, target }[]` |
| `log`                 | the sync store: server and per-user cache  | week Monday `YYYY-MM-DD` → exercise id → seven booleans          |
| `accent`, `dailyPick` | the sync store: server and per-user cache  | defaults `#30d158` and `3`. The accent is drawn as an ink (§6.2) |
| `theme`               | `fitness-planner-settings-v1` (the device) | `system` (default), `light` or `dark`                            |
| `showTotals`          | `fitness-planner-settings-v1` (the device) | `true` (default): the sections' StatFigures show                 |
| `configMode`          | no                                         | `false` (normal mode) on every load                              |
| `weekOffset`          | no                                         | `0` is the current week                                          |
| `now`                 | no                                         | a ref so "today" can move; see §5                                |

The stores start empty (showing the defaults) and never write the user's data themselves. The sync
store fills them with `adopt` and saves their changes (§7).

**Derived:** `monday`, `weekKey`, `currentWeekKey`, `nextWeekKey`, `label`, `days` (`name` "Thu",
`date` "22", `full` "Thursday 22 October" for the DayMarks' names, `key`, `isToday`, and
`isFuture` for days still to come), `exercises` (the visible week's plan, see §2), `carriedFrom`
(the source week, or null when the week has its own plan), `nextWeekHasPlan`, `dayCounts`,
`grandTotal`, and the helpers `isDone(id, day)` and `totalFor(id)`. Totals count only the week's
exercises, so a removed exercise's history stays in `log` without inflating the numbers.

**Actions** (plan edits apply to the visible week only): `toggle`, `changeTarget` (clamps 0–7),
`changeAmount` (Edit plan's row Stepper: a timed exercise's seconds, clamped 5–3600, else its reps,
1–999), `addExercise` (returns `false` for an empty name; new exercises get goal 3 unless the input
names one), `updateExercise` (replaces name, sets, reps or duration, per-side, weight and, when
given, the goal, keeping the id and history; `false` for an empty name or an id not in the week).
An exercise counts reps or time, never both: a duration stores reps as 0. Then `removeExercise`, `copyToNextWeek`, `setConfigMode`,
`prevWeek`, `nextWeek`, `thisWeek`, `refreshNow`, `setAccent`, `changeDailyPick` (clamps 1–8),
`setTheme`, `savedSettings` (the accent and daily pick, or null while the user has none of their own), `adopt`
(replace the data and settings wholesale), `adoptWeek` (replace one week's plan) and `clear` (forget
the user on sign-out, keeping the theme). The module also exports `exerciseDetails`, which gives the chips under a name:
"3 × 12" or "3 × 8 each side" (or "10 reps a set" and "8 each side" without sets, "3 sets" without
reps), "3 × 45 s" or "1 min 30 s each side" for a timed exercise (`durationText` in
`src/lib/words.ts`), then "16 kg" when weighted, and no chip at all for none of these (the Chip
card's words).

`useDietStore` holds `plans` of foods (`{ id, name, target }`) and its own `log`, kept by the sync
store like the planner's. It reads `planner.weekKey`, so week navigation moves both
sections. It derives `foods`, `dayCounts`, `grandTotal`, `goalsMet` and `nextWeekHasPlan`, and
offers `isEaten`, `totalFor`, `toggle`, `changeTarget` (0–7), `addFood` (goal 3, `false` for an
empty name), `removeFood`, `copyToNextWeek`, `adopt`, `adoptWeek` and `clear`. Food goals work
like exercise goals (met once the count reaches a non-zero goal); foods have no daily target.

The planner writes only the theme and `showTotals`, each merged into whatever
`fitness-planner-settings-v1` already holds.
`writeKey` skips the write when the stored string already matches, and swallows storage errors, so
with storage blocked or full the app keeps working in memory.

## 4. Storage format and validation

| Key                                | Holds                                                                                                | Written |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- | ------- |
| `fitness-planner-session-v1`       | `{ user }`: the last signed-in user                                                                  | yes     |
| `fitness-planner-cache-v1:<user>`  | the user's state as `GET /api/state` returns it, with `revs`                                         | yes     |
| `fitness-planner-outbox-v1:<user>` | writes not yet sent (§7)                                                                             | yes     |
| `fitness-planner-import-v1:<user>` | the first-login prompt's answer, `imported` or `dismissed` (§7)                                      | yes     |
| `fitness-planner-settings-v1`      | `theme`, read before first paint by `public/theme-init.js`, and `showTotals`                         | both    |
| `fitness-planner-view-v1`          | the phone's Today or Week choice, `today` or `week` (§5); the device's own, never synced or exported | yes     |
| `fitness-planner-v2`, `-diet-v2`   | exercise and food `{ plans, log }` from before accounts                                              | never   |
| `fitness-planner-v1`, `-diet-v1`   | the single-list format from before weekly plans                                                      | never   |

Since accounts, nothing writes the keys from before them. They stay because they hold what a browser
recorded locally, which the first-login import (§7) reads with the parsing, migration and
validation below (`readLegacyData`, `src/lib/legacy.ts`). Signing out does not remove them. Browsers isolate storage per origin, so a cache belongs to
one origin and one user.

**The rename.** Until 2026-10-24 every key began `exercise-planner-` rather than `fitness-planner-`.
`migrateKeyPrefix` (`src/lib/storage.ts`), called from `src/main.ts` before the stores start, moves
each old key to its new name, outbox included, so unsent writes survive. A value already under the
new name wins, and a copy that fails (storage full) leaves the old key for the next load to retry.
`public/theme-init.js` runs before that, so it reads the old settings key when the new one is
absent.

**Migration.** Before weekly plans, one list served every week: `{ exercises, log }` under
`fitness-planner-v1` (the design prototype's shape, under its key renamed) and `{ foods, log }` under
`fitness-planner-diet-v1`. When a v2 key is missing and its v1 key exists, `parsePlannerData` and
`parseDietData` convert it: the list becomes the plan for every week in the log and for the current
week, so every week looks as it did. A v2 value that is not a JSON object also falls back to
migrating v1 (or to nothing without one). Before accounts, the stores saved the converted result as
v2; now the conversion only feeds the import.

`parsePlannerData` (`src/lib/storage.ts`) validates field by field:

- Plans whose week key is not `YYYY-MM-DD`, or whose value is not an array, drop out.
- Items without a string `id` and `name` drop out; `reps` rounds and floors at 0; `target` rounds
  and clamps to 0–7, defaulting to 3.
- `duration` (seconds per set) is kept only as a whole number above 0, capped at 3600.
- `sets` is kept only as a whole number from 1 to 20 (larger values cap at 20); `weight` (kg) only
  as a positive number, rounded to 2 decimals and capped at 500. Otherwise the key is left out.
- Log weeks whose key is not `YYYY-MM-DD`, and entries that are not arrays, drop out; the rest
  normalise to exactly seven booleans.
- When migrating, a v1 payload that is not a JSON object, or whose list is not an array, yields the
  defaults; an empty list stays empty. The prototype trusted its stored data and crashed outright on
  a payload without `log`.

`parseDietData` applies the same rules to foods, with four default foods (Vegetables 7, Fruit 5,
Fish 2, Nuts 3).

`parseSettings` accepts any `#rrggbb` accent (not only the four inks' values, K3a in
[brand.md](brand.md) §4), clamps the daily pick to
1–8, and accepts only `system`, `light` or `dark` as the theme, falling back to the defaults
otherwise. Settings saved before the theme option existed load as `system`.

**Export and import.** Settings → Export downloads `fitness-planner-YYYY-MM-DD.json`:

```json
{
  "format": "fitness-planner-export",
  "version": 1,
  "exportedAt": "2026-10-24T09:30:00.000Z",
  "exercise": { "plans": {}, "log": {} },
  "diet": { "plans": {}, "log": {} },
  "settings": { "accent": "#30d158", "dailyPick": 3 }
}
```

The theme is not exported, because it belongs to the device rather than the person. Import… reads a
file through `parseExport` (`src/lib/transfer.ts`), which rejects anything that is not JSON, has
another `format`, or has a `version` other than 1. Files exported before the rename carry
`"format": "exercise-planner-export"` and import the same way (`OLD_EXPORT_FORMAT`, in both
languages). It validates the rest with the same normalisers
as storage, so a hand-edited file loads the way a hand-edited `localStorage` value would. Missing
`settings`, or settings that are not an object, mean "no settings".

An import **merges and never deletes** (`mergeTracked`, `mergeSettings`; the API's `import_data`
applies the same rules):

- A week that already has a plan keeps it; a week with no plan takes the file's.
- Ticks are OR-ed per week, item and day, so an import can add ticks but never clears one.
- The file's accent and daily pick apply only when the account has no settings of their own yet.

Confirming sends the file to `POST /api/import` (`sync.importFile`): the server merges it against
the account's real state in one transaction, and the app then reads the account afresh (after any
read already in flight, which predates the import). Local writes still queued go out first, so the
server merges against everything this device has; if they cannot be sent, nothing is imported. When
the import cannot be done, the popover says why (offline, a server failure, an ended session) and
keeps the file ready to try again. The confirm step names how many weeks and ticks the file adds
(`mergeSummary`, through `useImportSummary`, which the first-login prompt shares) before anything
is written. It is computed from the current state, so it stays right if another tab or a settings
change lands while it is open. Importing the same file twice adds nothing the second time. Adding a week can change what
an unplanned week carries forward from (§2). The import took its history from the file, so that is
the intended result.

`fixtures/transfer/` holds the parse and merge cases as JSON, each with its expected result.
`src/lib/__tests__/transfer.spec.ts` runs every case. The format is the contract for the API's
import and export as well: the API's tests (`api/tests/test_parity.py`) run the same files.

## 5. Decisions beyond the design

- **Cells are buttons.** The prototype's cells were clickable `div`s. Each day is a `DayMark`: a
  `button` with `aria-pressed` and a name such as "Squats, Friday 23 October, today" (today also
  carries `aria-current="date"`), so the grid works from the keyboard and with a screen reader. The
  grid is a `<table role="grid">` with `row`, `columnheader`, `rowheader` and `gridcell` roles, and
  one tab stop (§6.5).
- **A normal web page, not a window.** The handoff drew the app as a macOS window (traffic lights, a
  framed window on a backdrop). The app is an SPA, so it uses a full-width sticky navbar and a
  centred content column instead; the navbar keeps the week controls, Settings and Print….
- **Light and dark themes.** The handoff is dark-only. Settings offers System (the default, which
  follows `prefers-color-scheme` live), Light and Dark. `App.vue` toggles a `dark` class on
  `<html>`; `public/theme-init.js` applies the saved choice before first paint so a dark preference
  does not flash light while the bundle loads. It is a plain file rather than an inline script
  because the nginx CSP allows scripts only from `'self'`.
- **Settings popover.** The handoff calls accent and daily pick user settings but shows no UI for
  them. The popover (the Popover primitive, on Reka UI) adds one, plus the theme. The accent is a
  choice of four inks, Ink blue by default, and the stored value keeps its old format (K3a,
  [brand.md](brand.md) §4). The popover closes when focus leaves it, on Escape and on an outside
  click, and returns focus to the trigger. The theme and per-side choices are SegmentedControls:
  `aria-pressed` buttons in a `role="group"`.
- **Config mode and normal mode.** Normal mode, the default on every load, only ticks cells. The
  "Edit plan" Switch in the navbar (a `role="switch"` button) turns on config mode, which shows the
  edit and remove IconButtons, the goal Steppers, the add forms and "Copy plan to next week". The mode is not saved, so the
  app always opens ready for ticking.
- **Exercises are editable.** The handoff had no way to change an exercise after adding it. An
  Edit IconButton (`pencil`) on each exercise row (not foods) opens `EditExerciseDialog`, on the Dialog primitive (Reka UI),
  which traps focus, closes on Escape and returns focus to the button. Sets and
  weight are optional, weight in kg; the sets/reps chip and the weight chip are separate so they
  wrap in the narrow name column.
- **Steppers mark their bounds** (goal 0/7, daily pick 1/8) with `aria-disabled` and ignore the
  click there. `disabled` would drop keyboard focus mid-press. The store still clamps as a backstop.
- **Today refreshes.** A one-minute tick and `visibilitychange` both call `refreshNow`, which
  updates `now` only when the date has changed. A tab left open past midnight moves its highlighted
  column within a minute.
- **Export and import live in Settings.** Before accounts, data lived in one browser and the export
  file was the only way to move it or back it up. It is still each person's own copy of their data.
  Import is additive by design: restoring an old backup over newer data cannot lose the newer
  data.
- **Tabs stay in sync** through `storage` events on the user's cache key: a tab adopts another tab's
  state instead of overwriting it, and their writes share one outbox (§7). The plan had proposed a
  `BroadcastChannel`; the cache already lives in `localStorage`, whose events carry the same news
  with no second channel to keep in step.
- **Food sits below the exercises** on the same page, sharing the week navigation and the print
  sheet. It has no daily target, so its grid has no Picked row.
- **Print is black on white in either theme** (§6.7).
- **Narrow screens.** Below 640px the navbar drops Print…, shortens the switch's visible label to
  "Edit" (its accessible name stays "Edit plan"), and wraps "This week" and the switch to a second
  row at the right, leaving the brand mark, the arrows, the week and Settings on the first; below
  480px the wordmark becomes the "FP" monogram. Settings is a gear IconButton named "Settings" at
  every width. The markup keeps the desktop order, which is the tab order. Below 640px the app
  opens on the **Today list** (brand spec K5): today's exercises and foods, each with one DayMark,
  ticked through the same store actions as the grid, with no sideways scroll down to 320px. A
  Today | Week switch leads to the grids; the choice is remembered on the device
  (`fitness-planner-view-v1`, like the theme, never synced). Another week and Edit plan always show
  the grids, since the list only ever shows today and the plan is edited in the week; choosing
  Today returns to this week and turns Edit plan off. The grids keep a
  600px minimum and scroll sideways inside their own container, with the **name column sticky** at
  the left on the canvas, `scroll-padding-left` at its width so keyboard focus never lands under
  it, and the scroller opening with the day before today beside the names (another week opens at
  Monday). The table's minimum width keeps every day column at 56px or more: 600px on a phone and
  680px above, 848px and 928px in Edit plan. In Edit plan the name
  column is 384px, wider than the room a phone leaves for it, so there it scrolls with the days
  instead of sticking, and the grid opens at its left edge. This reverses the earlier "the grid
  scrolls sideways, as designed" (K5, F1).

## 6. Styling and the design system

Tailwind CSS 4, through `@tailwindcss/vite`, on the design system in `brand/design-system/`
([brand.md](brand.md)). Components style themselves with utility classes in their templates and
have no `<style>` blocks. Everything global is in `src/styles/main.css`.

### 6.1 Tokens and roles

- **Generated tokens.** `npm run tokens` writes `src/styles/tokens.css` from
  `brand/design-system/project/tokens.json` (through `scripts/design_preview.py --tokens-css` with
  `--dark-selector .dark`) and drops the generated `@font-face` rules. It holds every role's light
  value on `:root` and dark value on `.dark`, the four ink values, spacing, radius, the font
  families and the type-style classes. Nobody edits it by hand, and `.prettierignore` keeps
  Prettier off it, so a regeneration diff is always the tokens' own change.
- **Role utilities.** `main.css` imports Tailwind, then `tokens.css` into Tailwind's `components`
  layer (above the theme, below the utilities), then maps each role to a
  Tailwind colour in `@theme inline` (`--color-canvas: var(--canvas)`). Templates write
  `bg-canvas`, `text-ink-secondary` or `border-control-border`, and both themes follow without
  `dark:` variants. The roles are `canvas`, `panel`, `tile`, `line`, `control-border`, `ink`,
  `on-ink`, `ink-secondary`, `error-ink`, `focus`, `pen`, `highlight`, `caution-ink` and `scrim`.
- **No palette.** `--color-*: initial` switches Tailwind's default colours off, keeping only
  `transparent` and `current`, so a palette class such as `bg-red-500` or `text-white` generates
  nothing. Every colour on screen comes from a role.
- **Dark variant.** `@custom-variant dark` keys `dark:` to the `.dark` class rather than the media
  query, so the Light and Dark settings can override the OS. `public/theme-init.js` sets the class
  before first paint, and `App.vue` keeps it in step afterwards.
- **Type.** The type-style classes (`display`, `title-1`, `title-2`, `body-large`, `body`,
  `caption`, `label`, `note`) come from `tokens.css`. `main.css` adds the note's italic and the
  smaller `display` below 640px, in the same layer, so a utility beside a type class wins. Numbers use `tabular-nums`. The fonts are the Fontsource variable
  packages, imported in `src/main.ts` so Vite bundles them under `/assets/` (the CSP allows only
  `'self'`), with the latin files preloaded in `index.html`.
- **Shape, focus and scroll.** `rounded-sm`, `rounded-md` and `rounded-lg` follow the radius tokens,
  and `shadow-overlay` is the one shadow. A global `:focus-visible` rule draws a solid 2px `focus`
  outline at a 2px offset on every interactive element. `scroll-padding-top` on `<html>` keeps
  keyboard-focused content from scrolling under the sticky navbar.

### 6.2 The pen and the inks

The pen is the person's ink, so it lives in variables rather than in the stylesheet. `App.vue` runs
the stored accent through `inkFor` (`src/lib/inks.ts`, K3a) and sets `--user-pen-light` and
`--user-pen-dark` on `<html>`. `main.css` sets `--pen` from the first on `:root` and from the second
on `.dark`, falling back to Ink blue (`--ink-blue`) before they are set. Everything reads `--pen`
(`bg-pen`, `text-pen`), never the user variables. [brand.md](brand.md) §4 has the mapping.

### 6.3 The primitives

`src/components/ui/<name>/` holds the shared components, one folder each with the `.vue` file and
an `index.ts`. They are shadcn-vue (K1): owned source on Reka UI, added with the shadcn-vue CLI
(`components.json`: the Lucide icon library, `src/styles/main.css` as the stylesheet) and restyled
to the tokens and the cards. `cn` (`src/lib/utils.ts`) merges a consumer's classes over a
component's own.

| Group    | Primitives                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Basics   | Button (primary, secondary and quiet, 44px tall, `sm` 36px from 640px up), IconButton (44px, a required `label`), TextLink, BrandMark |
| Forms    | TextField, TextArea, SegmentedControl, Switch, Stepper, InkPicker                                                                     |
| Overlays | Dialog, ConfirmDialog with ConfirmHost, Popover                                                                                       |
| Planner  | DayMark, Chip, SectionHeader, StatFigure                                                                                              |
| Feedback | InlineMessage, Banner                                                                                                                 |

The other cards are composed in the screens: Header in `AppNavbar.vue`, Panel in `AuthCard.vue`
and `ImportPrompt.vue`, WeekGrid in `TrackerGrid.vue` and `TrackerRow.vue`, TodayList in
`TodayList.vue`. Icons are `@lucide/vue` at a 1.5px stroke, `aria-hidden` beside words. A
primitive's colour transitions last 120ms at most, stop under `prefers-reduced-motion`, and name
the properties they animate, so the focus ring never fades in.

### 6.4 Confirmations

`useConfirm()` (`src/composables/useConfirm.ts`) asks a yes-or-no question and returns a promise:
true for the verb, false for Cancel or Escape. One `<ConfirmHost />`, mounted once in `App.vue`,
shows the open question in a ConfirmDialog (Reka's AlertDialog). A newer question answers an older
one false. `returnFocus` names where focus goes on closing when the control that asked has gone, as
after a removal. Removing a row (`TrackerRow`) and copying over next week's plan (`WeekHeader`) ask
this way. Sign out uses a ConfirmDialog of its own in the Settings popover, because it shows the
unsynced count, a busy state and an error.

A question never outlives what it asked about. It is answered false when the component that asked
goes away, and `App.vue` closes any open question (`dismissConfirm()`) when the signed-in user
changes, as when another tab signs in as someone else. Remove and Replace also note the week before
asking and do nothing if the week changed while the question was open (past midnight on Sunday).

### 6.5 Keyboard in the grids

Each grid is one tab stop, following the WAI-ARIA grid pattern with a roving tabindex
(`createGridNav` in `src/composables/gridNav.ts`, run by `useGridNav` from `TrackerGrid`):

- **The stop** starts on today's DayMark in the first row (`[aria-current="date"]`), else the first
  day, else the first cell, and then stays on the last cell focused. A `MutationObserver` keeps
  exactly one stop as rows come and go.
- **Keys.** Arrows move cell by cell over the names, days, totals and the Picked row, and never
  wrap. Home and End go along the row, Ctrl+Home and Ctrl+End to the grid's ends. Space and Enter
  belong to the DayMark. An `aria-hidden` cell (the empty Picked cell under "Week") is skipped.
- **Edit plan.** The Stepper and IconButtons in a row header stay out of the Tab order. Enter or F2
  on the name cell lets them in, Tab moves among them, and Escape puts focus back on the cell.

"Skip to today", first in the tab order in `AppNavbar.vue`, focuses today's first mark: in the
phone's Today list when it shows, otherwise in the first grid that has today.

### 6.6 The phone layout

`usePhoneView` (`src/composables/phoneView.ts`) decides what the main screen shows below 640px
(`PHONE_QUERY`, Tailwind's `sm`). §5, "Narrow screens", has the behaviour. The sticky name column
is `stickyName()` in `TrackerRow.vue`, shared with the header and Picked cells in `TrackerGrid.vue`,
and `TrackerGrid` opens its scroller with today in view and scrolls a focused cell wholly clear of
the names.

### 6.7 Print

The `@media print` block in `main.css` gives a black-on-white landscape sheet from either theme. It
re-points the roles at black, white and greys, the only literal colours the system allows: done
dots print black, rings grey, chips outlined, and `--highlight` goes transparent. `--pen` is set
there too, so the user's ink can't leak through. Shadows and transitions are off.

- Anything marked `data-noprint` is hidden: the navbar, the phone's view switch, the sync status,
  the import prompt, Edit plan's controls and add forms, and a section's hint line if it has one. Dialogs, the
  popover and Banners carry `print:hidden`.
- "One extra" keeps its underline and words. The Picked row's `<tfoot>` prints as an ordinary row
  group, so a table split across pages repeats its header but prints the Picked row once, at the
  end.
- The Food section's heading stays with its grid (`print:break-inside-avoid`), and a section header never ends
  a page (`print:break-after-avoid`).

### 6.8 The style guide

`src/styleguide/` is the living style guide (K2): every primitive and planner component rendered by
its real source, in each state. `src/main.ts` mounts it instead of the app at `/styleguide` when
`import.meta.env.DEV` is true, so a production build drops it. The page's Theme and Ink menus set
the same `.dark` class and pen variables the app does (`src/styleguide/look.ts`), and the address
carries them (`/styleguide?theme=dark&ink=forest`), so a browser test can open any combination.
Each section is one entry in `src/styleguide/sections.ts`. Coverage excludes the folder, and the
browser checks run against it.

## 7. Accounts and sync

**Signing in.** `session.init()` runs before the first render. A user remembered in
`fitness-planner-session-v1` is signed in at once and their cache shown, then `GET /api/auth/me`
confirms it. A 401 asks them to sign in again, keeping unsent writes; being offline keeps them
working from the cache. With nobody remembered the app waits for the server, then shows the
sign-in form. Invite and reset links arrive as `#/invite/<token>` and `#/reset/<token>`. The token
goes to the API in request bodies only, and the fragment is cleared once the link is used or turns
out to be invalid; offline or busy, the page offers to try again. Signing out ends the server
session, then deletes the user's cache and outbox from the device. It is refused while offline: the
cookie is HttpOnly, so only the server can end it.

**One user per tab, always.** Every read and write sends `X-Expected-User` with the user the tab
shows, and the API refuses any other with 401 (`api.md` §3). A tab left open as one person can then
never read or write the account of someone who signed in afterwards in another tab: the cookie is
shared, the name is not. The session store also follows `storage` events on the session key, so
when another tab signs out or in as someone else, this tab stops syncing, clears the stores, and
follows. Every request gives up after 15 seconds and counts as offline, so one dead connection
cannot stall syncing; replies that arrive after a sign-out or a user switch are ignored.

**Writes.** The stores change state at once. A deep watcher in the sync store diffs their state
against `base`, the state the server is known to hold, and turns each difference into an operation
in the outbox:

- `plan`: a week's plan, sent as `PUT /api/plans/<section>/<week>` with the revision last seen;
- `tick`: one day of one item, `PUT /api/ticks/…`, so devices ticking different days never collide;
- `settings`: the accent and daily pick.

A newer operation for the same plan, cell or settings replaces a queued one. Each carries an id, so
the reply to one already in flight removes only that one. Plan and settings operations read their
values when sent, so the server always gets the latest. Operations go out one at a time, in order.
A tick on a week with no plan of its own creates the plan first, as on the device.

| Reply                                               | What happens                                                                           |
| --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| success                                             | dequeued; a plan's new revision is stored                                              |
| 409 with the server copy                            | that week shows the server's plan, with a notice                                       |
| 409 with no server plan                             | sent again as a create                                                                 |
| offline, a timeout, or a 5xx with no API error code | kept; retried after 5 s, doubling to 60 s, and at once when the browser is back online |
| 401                                                 | kept; the sign-in form appears, and sending resumes after signing in                   |
| any other refusal                                   | dropped, so one bad write cannot block the rest, with a notice that it was undone      |

Two devices creating the same week from the same carried plan send identical items, which the API
accepts without a conflict (P7 in [decisions.md](decisions.md)), so the common case raises no notice.

**Reads.** `GET /api/state` runs at start, on focus, on returning to a visible tab, and every minute
while visible. It replaces local state only when the outbox is empty, and only if nothing changed
locally while the read was in flight. A read first diffs the stores against `base` itself, because
Vue runs the watcher after a reply can already have landed. Without that, an edit made in the same
tick as the reply would be overwritten before it was ever queued. A refresh therefore never undoes
an edit that has not reached the server.

**The cache** holds the last state the stores showed, with each plan's revision, so a reload or a
cold start offline shows data at once. It is written on every change and every read. Another tab's
write to it arrives as a `storage` event, and this tab adopts it as both its state and its `base`:
that tab's own writes are already in the shared outbox. Adopting it also counts as a local change,
so a read this tab already had in flight cannot overwrite it. The cache is validated with the
storage normalisers when read, and outbox entries one by one, so a damaged key cannot break the app
or stick the outbox. A plan write for a week the stores no longer hold is dropped rather than sent
as an empty plan.

`SyncStatus` shows "Loading your data…" before the first state arrives. Offline, it shows a retry
button and how many changes are waiting. Conflict and refused-write notices stay until dismissed.
It sits in a live region that is always present, so screen readers announce each message.

**The first-login import.** Before accounts, each browser kept its own log under the keys in §4.
After sign-in, once the app has read the account from the server in this session (`sync.fresh`; a
cached copy could be stale), `ImportPrompt` reads those keys (`readLegacyData`). If they hold
anything the account lacks, it offers to add it, naming what it would add:

- **Add to my account** sends it through `importFile`, the same server merge as a file import, so
  nothing in the account is replaced or deleted.
- **Not mine** remembers the answer for this user on this browser.
- **Later** asks again on the next load.

The answer is kept in `fitness-planner-import-v1:<user>` (`imported` or `dismissed`), which signing
out leaves in place. If the account already holds everything the keys do (imported from another
device, say), the prompt records `imported` and never appears. Only an accent or daily pick in the
settings key counts as data: every device still writes its theme there. The old keys are never
changed, so a browser shared by two people offers its log to each until each answers.

The single-list format (v1) needs trimming first. The old app copied its one list onto every
logged week and onto the current week, so the screen looked as before. Imported into an account,
that copy on the current week would replace the account's own carried-forward plan for this week
and later ones, and an empty list would empty them. So the import puts the list only on the weeks
it was ticked in (on the current week only if it was never ticked), adds no plan for an empty list,
and reads a damaged v1 key as nothing rather than as the default exercises.

**Accepted limits.**

- Tabs share one outbox through `localStorage`, which Chrome copies between tab processes
  asynchronously. Two tabs of one user editing within that delay can each rewrite the outbox from
  a stale copy and lose the other's queued write. Duplicate sends are harmless (ticks carry their
  value, identical plans are accepted); this narrower case would need one outbox per tab.
- When a session ends by itself (expiry, a reset elsewhere), the device keeps that user's cache and
  outbox so unsent changes survive, and the sign-in form offers their username. Only signing out
  on purpose clears the device.
