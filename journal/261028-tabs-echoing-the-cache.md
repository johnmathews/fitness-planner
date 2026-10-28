# Two tabs echoing the cache

> Purpose: why a mark sometimes flickered and vanished on the deployed app, and why adopting
> another tab's cache no longer writes it back.

## 1. The report

On the deployed app, in Chrome with a mouse and the squiggles set, a click on a day's box border
showed the new mark for a moment and then lost it. A click in the middle seemed to work.

## 2. What it was

Nothing about where the click landed. Automated presses at the centre, the edge, the border and
the ink overhang toggled once each, in Chromium, WebKit and Firefox, with and without 400ms of
API latency. A logger on the deployed tab found the cause: more than 1,000 `storage` events a
second on `tracker-cache-v3:<user>`, from two other open tabs.

The two tabs wrote two different values in turn. One ran the code from before K57 (#50), whose
settings have no `foodPick`; the other ran the current code, which writes `foodPick`. Each tab
adopted the other's write (`sync.onStorage`), and `adopt` wrote the cache straight back in its own
words (confirmed: each event's `oldValue` and `newValue` differed only in `settings.foodPick`).
`writeKey` skips an unchanged value, which had made the write-back harmless while every tab wrote
the same shape. With two shapes it never settles. A click landed among the echoes, and a
stale copy from the other tab overwrote it (strongly supported: observed as the flicker, not traced
event by event). Reloading the old tab ended it (confirmed by John).

## 3. The fix

`adopt(state, persist)`: the `storage` path adopts with `persist` false, since the other tab's
state is already in the cache. Reads and the start-up cache still write it. An old tab can still
echo once, but the current code no longer answers, so one write costs at most one bounce. A test
in `sync.spec.ts` writes an older tab's cache (no `foodPick`) and checks that it stays exactly as
written. A two-tab check against the local stack, with a stand-in old tab, showed three cache
events for three clicks, and each mark stayed.

The `writeKey` comment in `lib/storage.ts` no longer claims that skipping unchanged values is what
stops an echo, and `docs/architecture.md` §7 and `docs/development.md` say adopting never writes
back.

## 4. What is deliberately not done

- **No `-v4` cache names**, as K14 does for a format change. `foodPick` is an added field that
  the old code drops, not one it misreads, and without the echo it costs nothing.
- **An older tab still resets `foodPick`** to its default in a current tab that adopts its cache,
  until the next read from the server. That predates this fix and ends when the old tab reloads.
- **The Settings screen John could not open** on the deployed app was not looked into; it may have
  been the same echo or something else.
