# Three kinds of mark, and a quieter phone header

John sent a phone screenshot with three things circled.

## The phone header loses "FP"

Below 640px the planner's bar no longer shows the wordmark (the "FP" monogram under 480px): on a
phone it was clutter next to the week and the gear. It is hidden with `invisible`, not removed, so
its grid column keeps the week in the middle. The Settings page keeps it, because its bar has
nothing else.

## Space above today's band

The Today | Week switch sat flush on the yellow band. `TodayList` now has `pt-4` (16px, `space-4`)
above the band. The Week view already had the WeekHeader's `pt-8`, so only the Today view changed.

## Great, partial, missed

A day's mark has three kinds now, as green, amber and red markers by a whiteboard: done well, done
in part, and tried but couldn't. A press steps an exercise's day empty, great, partial, missed,
empty. Answers to the questions asked first:

- **What counts:** every kind ("All three"). Totals, the Picked row and "One of three" all count a
  red day, because showing up is what the planner records.
- **The Ink setting:** removed. Colours that mean something can't be a personal choice. `pen` is
  now a fixed green and the four ink tokens, `InkPicker`, `src/lib/inks.ts` and the style guide's
  Ink menu are gone. The stored `accent` stays in the settings, the API and the export (nothing
  draws it), so no wire format changed for it.
- **Colour blindness:** each kind has its own shape as well as its pen: a full squiggle (`pen`), a
  half squiggle in the box's lower half (`pen-partial`), a cross (`pen-missed`). They print black and
  still read apart. A partial or missed day adds "partly done" or "couldn't do it" to the
  accessible name; `aria-pressed` stays true for any mark.
- **Food:** on and off only (`FOOD_CYCLE`).

The strokes are bigger and run a little past the box, as asked ("like someone had scribbled a bit
too quickly"). The svg was already `overflow-visible`, so only the paths changed.

Colours, measured against every surface in both themes (3:1 for a stroke; `pen` also 4.5:1 as the
met total's text): `pen` `#2e7a4c` / `#8fcbaa`, `pen-partial` `#a56f00` / `#e6b450`, `pen-missed`
`#c0392b` / `#ee7d72`. The red is deliberately not `error-ink` and the amber not `caution-ink`:
a missed day is a record, not a fault. The gate's `extra_contrast_pairs` hold all of them.

## The data change

A day used to be `true`/`false`; it is now `null | "great" | "partial" | "missed"` (`Mark`, `Days`
in `src/lib/storage.ts`). Everything old reads as before: `normaliseMark` turns a stored `true`
into `"great"`, so caches, localStorage, legacy logs and version 1 exports carry over unchanged.

- **API:** migration 2 adds `partial` and `missed` 7-bit masks to `ticks`. `days` still holds every
  marked day, so existing rows read as great. `PUT /api/ticks/…` takes `{"mark": …}` and still
  accepts the old `{"done": bool}`, for a tab or an outbox from before the deploy.
- **Outbox:** ticks queued as `done` are upgraded on load (`upgradeQueued` in the sync store).
- **Export:** version 2; version 1 still imports. Import keeps a marked day's mark and fills only an
  empty one from the file (it used to OR booleans). The shared fixtures cover both versions and the
  new merge rule, in both languages.
- **Words:** the import summary says "marked days", and drops "the ink".

decisions.md §4.1 records this as K9–K13 (K10 supersedes K3); the brand spec carries a status line.
