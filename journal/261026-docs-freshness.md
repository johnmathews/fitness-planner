# Documentation freshness after the full-screen week

A `/done` wrap-up after PRs #41 (the full-screen week) and #42 (sprinting between screens, and
the hand-drawn underline). Both were merged before the wrap-up ran.

## What the audit found

A separate reviewer cross-checked the docs against `main` at `bf58c2a`. It found about twenty
spots that still described removed behaviour as current: the Picked row and "one extra", week
totals, section figures, today's band, the phone's Today view and the snapping. It also found
three new test specs missing from the development guide, and `useFullscreen` named nowhere.
Status: confirmed (each finding came with file and line, and I re-read each before fixing it).

Fixed on the `docs-freshness` branch:

- README, architecture, brand, development, and the system's README, foundations, voice and seven
  cards now describe what ships.
- The decision log marks each superseded row (P19, K5, K9, K24, K25, K26, K30, K35), as D1 does.
- `caution-ink` is described as kept for InlineMessage's caution tone, with nothing on the planner
  using it since the Picked row went.
- Three code comments no longer mention the snapping, the Picked row or a section figure.
- The PlannerScreen preview lost its dead Picked-row styles.

## Checks on main before the wrap-up

These ran on `bf58c2a` and exited 0: unit tests with the coverage gate (704), e2e (41), lint,
types, format, the design gate, and the API's pytest. The same checks were green on PR #42 in CI.

## What is deliberately not done

- **Rotation and resizing.** The sprint runs only after a scroll. Rotating a phone or resizing the
  window can leave the page across two screens until the next scroll. Reported to John, not fixed.
- **The design system artifact** (claude.ai) still shows the cards from before #41. The repo is the
  source of truth, and republishing it is a separate step.
- **The sidebar.** It stays on the mockup only. John kept the top bar (K37).
- **The stale remote branch** `eng-pin-actions-sha` (PR #35, merged) waits for John's say-so before
  it is deleted.
