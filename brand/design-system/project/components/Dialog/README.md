A modal panel for one focused task, such as editing an exercise, over a dimmed page.

## Use

- **Scrim:** a full-viewport layer filled with `scrim` at 40% opacity. Put the opacity on the layer, never on the colour (no `color-mix`, no rgba), so the token stays the one source. The scrim appears only behind a dialog.
- **Panel:** `panel` fill, 1px `line` border (in dark there is no shadow, so the border is the edge), `radius-lg`, `shadow-overlay` (none in dark, where `panel` does the lifting), `space-6` padding (`space-4` below 640px), at most 416px wide and 16px from each screen edge on a phone.
- **Head:** the title in `title-2`, sentence case ("Edit exercise"), with a Close IconButton (Lucide `x`, 20px, 44px target) at its right.
- **Body:** fields with visible labels above them (TextField, and SegmentedControl drawn exactly as its card: 44px, `label` type on every segment, single choice with `aria-pressed`), `space-4` apart. Optional fields say so in a hint, not in the label's brackets: "Weight in kg" with "Optional. Leave empty for bodyweight."
- **Actions** at the end, right-aligned: secondary "Cancel", then primary (`ink` fill, K8) with a verb: "Save". They wrap rather than shrink.
- One dialog at a time. For a yes-or-no question use ConfirmDialog; for a small panel attached to a control use Popover.
- The dialog doesn't print.

## States

| State | Look |
| --- | --- |
| Open | scrim fades in, panel appears; no slide, scale or bounce. Under `prefers-reduced-motion` it appears at once. |
| Error on save | an InlineMessage (error) above the actions; the dialog stays open with the person's input |
| Busy | the primary button keeps its label and gets `aria-busy="true"` |

## Accessibility

- Build on a native `<dialog>` opened with `showModal()` (as `EditExerciseDialog.vue` does) or Reka UI's Dialog (K1): `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the title.
- On open, focus moves to the first field; Tab stays inside the dialog; Escape and the Close button close it; on close, focus returns to the button that opened it.
- The page behind is inert while the dialog is open.
- Every field has a `<label>`; a hint is linked with `aria-describedby`.
- The focus ring is a solid 2px `focus` outline at 2px offset; `focus` and `control-border` on `panel` are measured by the gate.

## You provide

The title, the content (usually a form), the primary verb and its handler, and the element to return focus to.
