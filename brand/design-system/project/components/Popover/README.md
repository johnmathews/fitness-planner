A small panel attached to the control that opened it; the app has one, Settings, under the settings IconButton in the Header.

## Use

- **Anchor:** the settings IconButton (Lucide `settings`, 20px, 44px target, label "Settings"). While open, the button has a `tile` fill and `aria-expanded="true"`.
- **Panel:** `panel` fill, 1px `line` border, `radius-lg`, `shadow-overlay` (none in dark), `space-4` padding, 296px wide. It opens `space-2` below the button with their right edges aligned, and stays inside the screen with a `space-4` margin on a phone.
- **Contents, in order** (from `SettingsPopover.vue`):
  1. The title "Settings" in `title-2`.
  2. **Theme:** a SegmentedControl, System | Light | Dark.
  3. **Ink:** an InkPicker of four swatches (Ink blue, Forest, Violet, Graphite), the chosen one's name beside the label in `caption` `ink-secondary`. Replaces "Accent" and its four iOS colours (K3).
  4. **Exercises a day:** a Stepper, 1 to 8, the daily pick.
  5. **Your data**, after a `line` rule: secondary buttons "Export" (Lucide `download`) and "Import…" (Lucide `upload`). Import's summary and its own Import | Cancel appear here, inline, beneath.
  6. **Account**, after a `line` rule: "Signed in as alex" in `caption` and a secondary "Sign out" (Lucide `log-out`). Sign out with unsynced changes asks first with a ConfirmDialog.
- Group labels in `label`, sentence case: "Theme", not "APPEARANCE".
- Settings take effect at once; there is no Save.
- Outcomes (import done, import failed, sign-out failed) appear inside the popover as an InlineMessage under the group that caused them.
- Doesn't print.

## States

| State | Look |
| --- | --- |
| Closed | the button alone |
| Open | button on `tile`, panel shown; appears without motion beyond a 120ms fade |
| Import pending | the import summary and Import · Cancel under the data buttons |
| Result | an InlineMessage (success, or error with what to do) |

## Accessibility

- Built on Reka UI's Popover (K1): the button has `aria-expanded` and `aria-controls`; the panel is `role="dialog"` labelled by its title.
- On open, focus moves into the panel; Tab moves through it; Escape closes it and returns focus to the button. **Focus leaving the panel closes it** (the old popover stayed open while focus moved to the grid underneath, F14), as does a click outside.
- The theme segments use `aria-pressed`; the swatches are a `radiogroup` with one tab stop and arrow keys between them, each named ("Forest"); the chosen swatch has `aria-checked="true"` and an `ink` ring at 2px offset, never colour alone.
- The Stepper's buttons are named "Fewer exercises a day" and "More exercises a day", use `aria-disabled` at the limits so focus stays put, and the value is an `<output aria-live="polite">`.
- The ink swatches meet 4.5:1 on `panel` in both themes (measured by the gate).

## You provide

The current theme, ink and daily pick with their change handlers; the export and import handlers; the signed-in name and the sign-out handler.
