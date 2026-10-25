A small panel attached to the control that opened it. The app has none at the moment: Settings, which was one, became the SettingsPage (2026-10-25) to have room to grow. The rules below are what a popover must follow when one comes back; the settings contents they describe now live on that page.

## Use

- **Anchor:** the settings IconButton (Lucide `settings`, 20px, 44px target, label "Settings"). While open, the button has a `tile` fill and `aria-expanded="true"`.
- **Panel:** `panel` fill, 1px `line` border, `radius-lg`, `shadow-overlay` (none in dark), `space-4` padding, 296px wide. It opens `space-2` below the button with their right edges aligned, and stays inside the screen with a `space-4` margin on a phone.
- **Contents, in order** (the Settings panel as it was; the SettingsPage card now owns them):
  1. The title "Settings" in `title-2`.
  2. **Theme:** a SegmentedControl, System | Light | Dark, drawn exactly as its card (44px, `label` type on every segment).
  3. **Ink:** an InkPicker, drawn exactly as its card: the label "Ink", the hint "The colour of a done mark.", then four 44px rows (Ink blue, Forest, Violet, Graphite), each a 24px dot, the name and a `check` slot; the chosen row has the `ink` ring round its dot, the check and its name at 600. In the 296px panel the rows stack in one column. Replaces "Accent" and its four iOS colours (K3).
  4. **Exercises a day:** a Stepper, 1 to 8, the daily pick, drawn as its card (one outline, no separators), with its label beside it.
     Then **Show weekly totals:** a Switch, on by default, that shows or hides both sections' StatFigures on this device.
  5. **Your data**, after a `line` rule: secondary buttons "Export" (Lucide `download`) and "Import…" (Lucide `upload`). Import's summary and its own Cancel then Import (secondary first, primary last) appear here, inline, beneath.
  6. **Account**, after a `line` rule: "Signed in as alex" in `caption` and a secondary "Sign out" (Lucide `log-out`). Sign out with unsynced changes asks first with a ConfirmDialog.
- Every button in the panel is md (44px), on desktop as on a phone: the popover is used on phones.
- Group labels in `label`, sentence case: "Theme", not "APPEARANCE".
- Settings take effect at once; there is no Save.
- Outcomes (import done, import failed, sign-out failed) appear inside the popover as an InlineMessage under the group that caused them.
- Doesn't print.

## States

| State | Look |
| --- | --- |
| Closed | the button alone |
| Open | button on `tile`, panel shown; appears without motion beyond a 120ms fade |
| Import pending | the import summary and Cancel · Import under the data buttons |
| Result | an InlineMessage (success, or error with what to do) |

## Accessibility

- Built on Reka UI's Popover (K1): the button has `aria-expanded` and `aria-controls`; the panel is `role="dialog"` labelled by its title.
- On open, focus moves into the panel; Tab moves through it; Escape closes it and returns focus to the button. **Focus leaving the panel closes it** (the old popover stayed open while focus moved to the grid underneath, F14), as does a click outside.
- Theme is a SegmentedControl: a `role="group"` labelled "Theme" of `aria-pressed` buttons, single choice (pressing the chosen segment keeps it chosen); Tab enters the group and arrow keys move between segments (Reka's roving focus).
- The inks are a `radiogroup` labelled "Ink" and described by its hint, with one tab stop (the chosen ink) and arrow keys that move and choose; each row is a `role="radio"` named by its visible name ("Forest"); the chosen one has `aria-checked="true"`, the ring, the check and the bold name, never colour alone.
- The Stepper's buttons are named "Fewer exercises a day" and "More exercises a day". At a limit the button gets `aria-disabled="true"` (so focus stays put) and is drawn as the Stepper card draws it: its icon at 40% opacity, no hover fill. The value is an `<output aria-live="polite">`.
- The ink dots meet 4.5:1 on `panel` in both themes (measured by the gate).

## You provide

The current theme, ink and daily pick with their change handlers; the export and import handlers; the signed-in name and the sign-out handler.
