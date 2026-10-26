# A bigger bar

> Purpose: why the Header grew to the week's size, gained BarActions and lost its Switch, and how
> the change was checked.

## 1. The ask

John found the bar "small skinny and delicate" under a bold, big, chunky week, and asked for it
thicker, full width like the content, with more substantial icons and each action's name under
its icon. The bar is out of sight on the planner's screens until it is wanted (K25), so it can be
much bigger than a bar that is always visible.

## 2. The decisions

The mockup `brand/design-system/mockups/261026-bar-bigger` drew the bar on the live prototype
and asked two questions. John picked A for both, then moved actions in rounds 2 and 3:

- **K47:** the bar spans the window on the page's 48u margins. Every size follows `u`: a 32u
  wordmark, the week at 26u between 32u arrows, and the actions as BarActions, each a 32u
  Lucide icon over its 17u name. The bar is 108px tall at 1280×800 and 163px at 1920×1200,
  against 56px before. Folded, the week takes the first row and the actions share the second.
- **K48:** Edit plan is a pencil BarAction with `aria-pressed`, filled `ink` while on. It replaces
  the Switch, so every action in the bar has one shape.

- **K49**, from John's two comments on the mockup: Edit plan moved just right of the wordmark,
  and Full screen became the last action, at the far right. The markup follows, so Edit plan
  now comes before the week in the tab order. Folded, CSS order puts the week on top, and Edit
  plan leads the actions' row.

- **K50**, round 3: beside the wordmark, Edit plan read as part of the name. John picked option A
  of three. Edit plan joined the actions just left of Settings, and "This week" moved beside the
  week's arrows. With "This week" in the right-hand group, the group grew too wide and pushed the
  week about 120px off centre at 1920×1200.

BarAction is a new card and a Vue primitive, with a style guide section and a spec. Its sizes
come from main.css's `--bar-*` variables, beside the planner's other named sizes. No screen uses
the Switch now. Its card and primitive stay, and its README says so.

## 3. Things to know

- Edit plan and the Settings page keep the bar sticky (K27), so there it takes its full height.
  The bar is full width, while the Edit plan column stays centred at 1152px.
- Round 2's tab-order note no longer applies: Edit plan comes after the week again. Folded,
  "This week" leads the actions' row, and the tab order still reaches it before the week.
- A BarAction is named by its visible text, not an `aria-label`. Tests now find Edit plan and
  Settings by `data-testid`, and e2e matches "Edit plan" exactly, since "Edit Plank" also
  matches it as a substring.
- The main checkout's `node_modules` predates `markdown-it` (#46). The worktree ran `npm ci`
  of its own.

## 4. Checked

The design gate, 739 unit tests, lint, type-check and 45 end-to-end tests passed. All previews
render at 375px; only the Cover overflows, as allowed. In the running app the bar measures
163px with 48px icons at 1920×1200, 109px with 32px icons at 1280×800, and two rows on a 390px
phone. No width scrolls sideways.
