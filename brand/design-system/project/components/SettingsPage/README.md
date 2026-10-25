Settings as a page of its own, at `#/settings`: a link back to the week, the heading, then Appearance, Planner, Your data and Account, each a section under its own heading.

## Use

- **Opening it:** the settings IconButton in the Header (Lucide `settings`, label "Settings") goes to the page. On the page the Header holds only the wordmark; the week navigation, the Edit plan Switch, Settings and Print belong to the week.
- **Layout:** one column at most 576px wide, centred under the Header, `space-6` above it. First a TextLink with a 20px `chevron-left`, "Back to the week", then the page's one `<h1>` "Settings" in `display`, `space-4` below the link. Sections follow `space-8` apart; each after the first opens with a 1px `line` rule and `space-8` above its heading. A section's heading is an `<h2>` in `title-2`, sentence case; its contents are `space-4` apart.
- **Contents, in order** (from `SettingsPage.vue`):
  1. **Appearance:** Theme, a SegmentedControl, System | Light | Dark, drawn exactly as its card. Nothing else: the `pen` colours are fixed, so there is no ink to choose.
  2. **Planner:** Exercises a day, a Stepper from 1 to 8 with its label beside it; then Show weekly totals, a Switch, on by default, that shows or hides both sections' StatFigures on this device.
  3. **Your data:** one line in `body` `ink-secondary` saying what each does ("Export saves everything to a file. Import adds a file's plans and marks to yours and never deletes anything."), then secondary buttons "Export" (`download`) and "Import…" (`upload`), at their own width. Import's summary and its own Cancel then Import (secondary first, primary last) appear beneath.
  4. **Account:** "Signed in as alex" in `body` (the name in `ink`), then a secondary "Sign out" (`log-out`). Sign out with unsynced changes asks first with a ConfirmDialog.
- Every button is md (44px). Settings take effect at once; there is no Save.
- Outcomes (import done, import failed, sign-out failed) appear as an InlineMessage at the end of the section that caused them.
- Room to grow: a new setting goes in the section it belongs to, or a new section, never in the Header.
- Doesn't print.

## States

| State | Look |
| --- | --- |
| Arrived | focus on the `<h1>` (it takes focus with `tabindex="-1"`, no ring), so a screen reader starts at the top |
| Import pending | the import summary and Cancel · Import under the data buttons |
| Result | an InlineMessage (success, or error with what to do) |
| Back to the week | the week as it was; focus on the Header's Settings button |

## Accessibility

- A real page: the hash changes, so the browser's Back works, and a `#/settings` address opens it directly.
- One `<h1>`, then an `<h2>` per section; each section is a `<section>` labelled by its heading, and the data buttons are a `group` labelled by theirs.
- Theme, the Stepper and the Switch keep their own cards' keyboard and naming rules: "Fewer exercises a day" and "More exercises a day".
- After the sign-out question closes without signing out, focus returns to Sign out.

## You provide

The current theme, daily pick and totals setting with their change handlers; the export and import handlers; the signed-in name and the sign-out handler; the address of the week for the link back.
