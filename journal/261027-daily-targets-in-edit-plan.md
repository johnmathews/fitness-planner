# Daily targets in Edit plan

> Purpose: why the daily targets moved from Settings into Edit plan, why Food gained one, why
> "Copy plan to next week" went, and how the change was checked.

## 1. The ask

John asked for four things. Theme should sit at the bottom of Appearance. The Planner section
should leave Settings, with its "exercises a day" counter beside the section's name in Edit plan.
Edit plan should drop the week beside each title. Finally, what does "Copy plan to next week" do,
when plans carry forward anyway?

## 2. Copy plan, answered

A week without a plan of its own shows the latest earlier week's plan, live (`planSource`). So an
edit to this week already reaches every untouched week after it. The button only mattered in two
cases: next week already had its own plan, which it replaced after a confirmation, or the user
wanted next week frozen against later edits. John chose to remove it (K58).

## 3. The decisions

Asked before the mockup:

- Food gets its own target, **Foods a day** (K57), rather than only Exercises. A food day turns
  green as an exercise day does.
- Both targets stay one setting for every week, not part of each week's plan. The plan format and
  the export version stay as they are.

The mockup `brand/design-system/mockups/261027-edit-plan-targets` asked where the Stepper sits on
the title line. John picked **B**: the words, then the Stepper, at the end of the line where Copy
plan was (K56). Settings puts Theme under Marks and has no Planner section (K59).

## 4. How it is built

- `foodPick` (default 2, 1 to 8) sits beside `dailyPick` everywhere a setting goes: the planner
  store, `PortableSettings`, the sync diff and `PUT /settings`, the export, the API's
  `normalise_portable`, and a new `settings.food_pick` column (schema version 5, default 2).
- `PUT /settings` without a `foodPick` keeps the saved one. A tab still running the previous
  build sends no `foodPick`, and would otherwise reset it to the default.
- An export without `foodPick` reads as the default, so older files still import. No version bump
  was needed: older readers ignore the extra field.
- `ExerciseGrid` and `DietSection` put a Stepper in `SectionHeader`'s actions in config mode, and
  pass no week there. `DietSection` passes `metDays` against `foodPick`.
- `main.css` sizes a Stepper inside `[data-slot='day-target']` at the page's `--set-*` size, as
  Settings and the dialogs do.
- `CopyPlan.vue`, the stores' `copyToNextWeek`, `nextWeekHasPlan`, `nextWeekKey` and
  `carriedFrom`, and their tests and style guide examples are gone.

## 5. Three more rounds on the target

Built at the end of the line, the target was far from its title. In round 2 John asked for it
back on the left and picked A: right after the title, as one phrase, "Exercises − 3 + a day"
(K61). Built, that looked "too big and chunky". Round 3 centred it on the title line, under the
bar's week, at two smaller sizes. John picked max(44px, 40u) (K62).

- `SectionHeader` is three columns on screen, like the Header: the title, the actions, an empty
  column. Folded it goes back to a wrapping flex row, so the target follows the title.
- The target's Stepper shows its own label again ("Exercises a day"), and `main.css` sizes it
  from `--target-control` rather than the page's 60u `--set-control`.

Round 4 asked about the words. With the label stacked over the Stepper as the other option, John
picked no words at all: the Stepper reads "− 4 per day +" (K63). `Stepper` gained an optional
`suffix`, shown after the value inside the outline and hidden from a screen reader, which still
hears the hidden label, "Exercises a day", and the value.

## 6. Checks

- Web: `vitest` (all suites), `vue-tsc`, `oxlint` and `eslint`, `prettier --check`.
- API: `pytest`, `mypy`, `ruff`. New tests cover clamping `foodPick`, keeping it when a client
  sends none, the migration's schema version, and the shared transfer fixtures.
- New app tests cover the Steppers on the title lines, no week in Edit plan, the 1–8 bounds and
  sync, and a food day turning green and back as the target changes.
- `check_design_system.py --complete` passes with the SectionHeader, SettingsPage, Stepper,
  WeekGrid, ConfirmDialog and Button cards updated.
- Wrap-up (`/done`): a separate docs audit against the shipped code found 13 stale or missing
  claims (a met day's check in brand.md, foundations.md and the system README; Copy plan in
  development.md and two cards; "the daily pick" in the README; dead label CSS); all fixed. axe
  caught the "per day" Stepper's value at 23.8px wide, under the 24px target size; it is now at
  least 28px. Confirmed: vitest, Playwright, pytest, mypy, ruff and the design gate pass locally.

## 7. What is deliberately not done

- **Foods a day is one setting, not part of each week's plan.** Asked and decided before the
  mockup, so the plan format and the export version stay as they are.
- **The export version stays 4.** `foodPick` is an extra field: older readers ignore it, and a
  file without it reads as the default.
- **No lock around `PUT /settings`' read and write.** Keeping the saved `foodPick` reads it first;
  two saves landing at once for one user could race. Settings are one user's, saved one at a time.
- **No way to copy a plan over a week that already has its own.** That was Copy plan's only real
  use, and the owner chose to remove it (K58). Editing that week by hand is the way now.
