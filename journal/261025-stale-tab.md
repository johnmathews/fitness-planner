# A tab from before the marks emptied the boxes

The owner reported that in Chrome a press drew the mark for a moment and then left the box empty.
The API logs showed every press arriving and the database held the marks, so the server was right
and the page was wrong.

Cause: a Chrome tab still open on the code from before the three marks (#28). Tabs share the
per-user cache in `localStorage` and adopt each other's writes through `storage` events. The old
tab's normaliser reads only `true` as a marked day, so it read `"great"` as empty, adopted that and
wrote its copy back; the new tab adopted the empty copy. The old tab could also have dropped the new
tab's queued marks, since its outbox reader discards entries it doesn't know and rewrites the list.

The #28 review had flagged the old tab as showing empty boxes until reloaded. It missed that the old
tab would write the empties back into the shared cache.

Fix (K14): the cache and outbox keys are now `-v2`, so old and new tabs never read each other. Sign-in
moves a `-v1` cache (a `-v2` one wins) and merges a `-v1` outbox, then deletes both. A regression test
replays the old tab's write; on the `-v1` names it fails with the box empty.

Rule for next time: a change to the cache's or the outbox's format bumps their key version.
