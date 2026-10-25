# Mockups before code, as a workflow

John asked for visual changes to be shown as a mockup before any code is written, in this project
and in every other web app. He also wanted it to be part of the design-system skill.

## What a test showed

Before any guidance was written, a fresh agent got a typical request in a copy of this repo with
the skill as it was ("make today's band a soft blue, the Picked figures bolder"). It did stop for
a picture before touching code. It also:

- wrote two one-off scripts of its own (a contrast measurer and a page builder);
- put the mockup in a temporary folder outside the repo, with font paths that only worked from a
  local server;
- recorded nothing about the question or the pick, so the mockup would be gone after the session;
- updated two of the project's script copies on the side.

The gap was that mockups weren't predictable or kept, so the guidance gives them a fixed shape.

## What the skill now has

- **`references/mockups.md`:** the loop: brief, options, build, look, publish, iterate, record,
  then code. It also says when a mockup can be skipped.
- **`scripts/mockup.py`:**
  - `new` starts `brand/design-system/mockups/<yymmdd>-<slug>/` with a page and a decision
    record.
  - `build` writes `dist/`: the page as an Artifact fragment, the system's tokens in the
    Artifact's theme contract, its fonts, and a full-document preview.
- **The theme contract:** any element with `data-theme="light"` or `"dark"` switches its subtree,
  so every option shows the same stage in both themes side by side.
- **`scripts/render_mockup.mjs`:** desktop and phone, light and dark, with lines for overflow,
  console errors and failed loads.
- **`templates/mockup.html`:** options as sections. Proposed values are `--candidate-*`
  properties, and the stage is copied from the affected cards' `preview.html`. Contrast measures
  are computed on the page in both themes.
- **`templates/mockup-readme.md`:** question, status, link, options, decision, rounds.
- **`enforcement.md` and `brand-doc.md`:** a CLAUDE.md rule and a docs section for every project.

A candidate that names another property (`--candidate: var(--ink)`) has to be declared on each
themed subtree too (`#a, #a [data-theme]`). Otherwise it resolves once, at the option, and keeps
the page theme's value inside the dark pane.

## Here

- **Rule:** CLAUDE.md now says a visual change starts as a mockup and waits for John's pick.
  docs/brand.md §11 describes the folder.
- **First example:** `261025-pen-partial-yellow` records the yellow decision (K18) in the new
  format. It is published as a private artifact: https://claude.ai/artifact/FSw6CogHgLgXrYbNH61ecz
