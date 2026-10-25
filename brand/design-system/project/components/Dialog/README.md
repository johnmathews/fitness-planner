A modal panel for one focused task, such as editing an exercise, over a dimmed page.

## Use

- **Scrim:** a full-viewport layer filled with `scrim` at 40% opacity. Put the opacity on the layer, never on the colour (no `color-mix`, no rgba), so the token stays the one source. The scrim appears only behind a dialog.
- **Panel:** `panel` fill, 1px `line` border (in dark there is no shadow, so the border is the edge), `radius-lg`, `shadow-overlay` (none in dark, where `panel` does the lifting), `space-6` padding (`space-4` below 640px), at most 416px wide and 16px from each screen edge on a phone.
- **Head:** the title in `title-2`, sentence case ("Edit exercise"), with a Close IconButton (Lucide `x`, 20px, 44px target) at its right.
- **Body:** fields with visible labels above them (TextField, and SegmentedControl drawn exactly as its card: 44px, `label` type on every segment, single choice with `aria-pressed`), `space-4` apart. Fields are not marked optional or required; a hint says only what an empty field means: "Weight in kg" with "Leave empty for bodyweight." Edit exercise reads: Name; Sets, **Measure** (Reps, Time), the amount ("Reps", or "Seconds" once Time is chosen) and **Reps count** ("Timed" for Time); Weight in kg; then **Times a week**, the goal, as a Stepper from 0 to 7.
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

- Built on Reka UI's Dialog (K1), as the app's `Dialog.vue` is: the panel is `role="dialog"` with `aria-modal="true"`, `aria-labelledby` pointing at the title (an `h2`), and `aria-describedby` pointing at the description when there is one (none otherwise). The scrim is Reka's overlay, `scrim` at 40% on the layer.
- On open, focus moves to the first field, not the Close button before it. Focus is trapped: Tab and Shift+Tab stay inside the dialog. Escape, the Close button and a click on the scrim close it.
- On close, focus returns to the control that opened it: the trigger, or whatever had focus when the dialog opened from code, also when the dialog mounts already open (an Edit button that shows the dialog with its item).
- While it is open, the page behind is hidden from assistive technology and takes no pointer input.
- Every field has a `<label>`; a hint is linked with `aria-describedby`.
- The focus ring is a solid 2px `focus` outline at 2px offset; `focus` and `control-border` on `panel` are measured by the gate.

## You provide

The title (and, when it helps, a short description under it), the content (usually a form), the primary verb and its handler, and how it opens: a trigger control, or `v-model:open` from code. The dialog finds the element to return focus to by itself.
