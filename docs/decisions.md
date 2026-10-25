# Decisions

> Purpose
>
> The record of why the planner has accounts, a Python API and server-side sync, and of the
> choices made while building them in October 2026, then of the calls behind its design system. The journals and pull requests cite these IDs
> (D3, P7, K5); this is where they resolve. The current design lives in
> [architecture.md](architecture.md), [api.md](api.md) and [brand.md](brand.md); this file keeps the
> reasons.

## 1. Context

Until October 2026 every log lived in one browser's `localStorage`. Data did not move between
devices, nothing was backed up, and the public route at `fitness.itsa-pizza.com` needed no auth
because nothing was on the server. The route runs Cloudflare tunnel → Traefik (rate-limited) → the
web container on infra-vm, whose port is also reachable on the LAN, so no design may trust an
unauthenticated header.

## 2. Settled before the build (2026-10-23)

| ID  | Topic                   | Decision                                                                                      | Rejected                                       |
| --- | ----------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| D1  | Users                   | John plus a few named people; no open sign-up (superseded by D9)                              | —                                              |
| D2  | Scope                   | Server accounts, synced across devices                                                        | Local profiles per browser: no sync, no backup |
| D3  | Auth                    | Username and password in the app; Cloudflare Access stays off the route (extended by D10–D11) | Verifying Access JWTs                          |
| D4  | Shape                   | The nginx web container plus a separate API container                                         | One Node container serving both                |
| D5  | API language            | Python 3.13, FastAPI, uv, pytest and coverage                                                 | TypeScript, sharing the validators             |
| D6  | Routing                 | nginx `proxy_pass` forwards `/api` to the API service                                         | —                                              |
| D7  | Accounts                | Single-use invite links, minted from an admin CLI (joined by sign-up, D9)                     | The CLI setting passwords itself               |
| D8  | Access in front as well | No: one login                                                                                 | —                                              |

The rejected options in D3, D4, D5 and D7 were the recommendations at the time. D5's cost, two
copies of the validation rules, is paid by the shared fixtures in `fixtures/transfer/`, which both
test suites run.

### 2.1 Open sign-up (2026-10-25)

| ID  | Topic   | Decision                                                                                                                                                                                    | Rejected                                                                                          |
| --- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| D9  | Sign-up | Anyone can create an account with an email and a password. Guardrails: `MAX_USERS` (default 50; 0 closes sign-up, leaving invites), 10 sign-ups an hour, and a 5 MiB quota on every account | Approval by `fp-admin` before first login; a shared sign-up code; no limits at all                |
| D10 | Email   | The email is only a login name, stored lower-cased in `users.username`. No mail is sent: no verification, no self-service reset                                                             | Verification and "forgot password" by mail, which need a mail provider; a separate `email` column |
| D11 | Sign-in | One field takes an email or a username, since both live in the same column                                                                                                                  | Email only, which would strand invited users until each had an email attached                     |

D9 supersedes D1, and with it the premise behind two accepted risks in [api.md](api.md) §8: the
unbounded per-user data (now the quota) and an account count bounded only by invites (now
`MAX_USERS` and the hourly limit). John chose all three on 2026-10-25.

## 3. Made while planning and building (2026-10-24)

| ID  | Decision                                                                                                                                | Why                                                                                                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| P1  | One export format (`fitness-planner-export` v1) for the file, `GET /api/export` and `POST /api/import`                                  | One validator per language, one set of fixtures                                                                   |
| P2  | Import always merges and never deletes: existing weeks keep their plan, ticks are OR-ed, settings apply only when there are none        | No import, anywhere, can destroy data                                                                             |
| P3  | The theme is never exported or synced                                                                                                   | It belongs to the device; `public/theme-init.js` reads it before first paint                                      |
| P4  | Invite and reset tokens travel in the URL fragment, then in request bodies, never in a path                                             | No access log (Traefik, nginx, uvicorn) records them                                                              |
| P5  | The CLI fixes the username when it mints an invite                                                                                      | A leaked link cannot claim an arbitrary name                                                                      |
| P6  | Every write must carry `Origin` equal to `PUBLIC_ORIGIN` and a JSON body                                                                | `SameSite=Lax` alone treats other `*.itsa-pizza.com` hosts as same-site                                           |
| P7  | A plan create whose items match the stored plan succeeds instead of conflicting                                                         | A first tick creates the week's plan, and two devices do that from the same source                                |
| P8  | Argon2 at its defaults, one hash at a time, a bounded login queue, and the API's own memory limit (160m, measured)                      | One hash takes 64 MiB, the web container's whole limit                                                            |
| P9  | Synced data lives in new per-user cache keys; the keys from before accounts are never written                                           | The old data survives untouched, for the first-login import                                                       |
| P10 | nginx forwards to the host `fitness-api:8000`                                                                                           | The production compose file names the service to match                                                            |
| P11 | Invite links last 7 days; reset links 24 hours                                                                                          | John, at the planning gate                                                                                        |
| P12 | Sessions last 90 days from last use, refreshed at most daily; logout ends one, a reset ends all                                         | John, at the planning gate                                                                                        |
| P13 | The home-server deployment (W5) is part of this work, not a hand-off                                                                    | John, at the planning gate                                                                                        |
| P14 | Every request names its user (`X-Expected-User`), and the API refuses any other                                                         | A tab left open as one person must never touch the account of someone who signed in later on the same browser     |
| P15 | Writes become operations by diffing the stores against the state the server is known to hold, rather than one API call per store action | Every write path, present and future, syncs without extra code                                                    |
| P16 | Tabs share the cache and outbox through `localStorage` events, not a `BroadcastChannel`                                                 | The cache is in `localStorage` already; one channel instead of two                                                |
| P17 | Sign-out is refused while offline                                                                                                       | The session cookie is HttpOnly, so only the server can end it                                                     |
| P18 | Imports, from a file or the first-login prompt, merge on the server in one request                                                      | One transaction against the account's real state, not one write per tick                                          |
| P19 | The phone's choice between Today and Week is kept per device in `localStorage` (`fitness-planner-view-v1`), never synced or exported    | Like the theme (P3), it suits the screen, not the person. The phone still opens on Today until someone picks Week |

## 4. The design system (2026-10-24)

The brand spec ([2026-10-24-brand-design.md](specs/2026-10-24-brand-design.md) §10) made these calls
on the owner's behalf, open to veto by ID. All were approved, and K3a was added while planning.
[brand.md](brand.md) describes the result.

| ID  | Decision                                                                                                                                                                                                                    | Why                                                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K1  | The component layer is shadcn-vue: owned source on Reka UI, restyled to the tokens, in `src/components/ui/`                                                                                                                 | Tested keyboard and focus behaviour for Dialog, Popover and Stepper, at about 67 KB gzipped. Rejected: hand-rolled primitives, the evaluation's first preference     |
| K2  | The living style guide is two things: the published Design System artifact (the brand book) and the dev-only `/styleguide` route, which renders the real components in both themes and all four inks                        | The artifact is for people and agents designing. The route is what the accessibility and visual checks run against                                                   |
| K3  | Four inks replace the four iOS accents. Saved accents map blue to Ink blue, green to Forest, purple to Violet and orange to Ink blue                                                                                        | Every ink is measured for contrast in both themes. An orange pen could be mistaken for `caution-ink`. Supersedes the handoff's accent swatches and the green default |
| K3a | The stored accent keeps its wire format: any `#rrggbb`, `#30d158` for missing or invalid input. `inkFor` (`src/lib/inks.ts`) turns it into an ink, Ink blue when nothing is saved, and choosing an ink stores its light hex | No change to the API, the export format, the parity fixtures or sync                                                                                                 |
| K4  | No monospace: numbers use Source Sans 3 with tabular figures                                                                                                                                                                | One family for words and numbers. Tabular figures keep columns aligned                                                                                               |
| K5  | Below 640px the app opens on a Today list, and the week grid's name column is sticky                                                                                                                                        | On a phone today's column sat off-screen (F1). Supersedes "the grid scrolls sideways, as designed" in architecture.md §5                                             |
| K6  | Notes on an exercise or a set are a separate feature, built after the system. The system supplies NoteMark and NoteEditor                                                                                                   | Keeps this work to the look, while giving notes a designed home                                                                                                      |
| K7  | "Have fun. Avoid injury. Don't stop." stay principles in the brand spec and never appear in the UI                                                                                                                          | A slogan on screen is the kind of gimmick the brand rules out                                                                                                        |
| K8  | The primary action colour is `ink`, not a brand blue                                                                                                                                                                        | One colour for "act", and the `pen` for "done"                                                                                                                       |

## 5. Accepted risks

Each is described where it applies:

- the lockout and sign-up reveal which usernames and emails have accounts; the lockout can block
  one; sessions have no absolute lifetime; anyone can claim an email that is not theirs; strangers
  can fill the account cap or the hourly limit ([api.md](api.md) §8);
- two tabs racing on the shared outbox inside Chrome's cross-process delay, and a session that ends
  by itself keeping its cache ([architecture.md](architecture.md) §7);
- while the API restarts, Docker's DNS can forward the web container's `fitness-api` lookup to the
  LAN resolver (home-server `documentation/infra_vm.md`, "Fitness").

## 6. How it was built

Six units, each its own pull request with a journal entry:

| Unit | What                              | PR               | Journal                                     |
| ---- | --------------------------------- | ---------------- | ------------------------------------------- |
| W1   | JSON export and import            | #6               | `journal/261024-export-import.md`           |
| W6   | Sample-data fixture               | #7               | `journal/261024-sample-export-fixture.md`   |
| W2   | The API service and its image     | #8               | `journal/261024-api-service.md`             |
| W3   | Sign-in, sync and the nginx proxy | #9               | `journal/261024-synced-client.md`           |
| W4   | The first-login import prompt     | #10              | `journal/261024-import-prompt.md`           |
| W5   | The infra-vm deployment           | home-server #245 | home-server `journal/261024-fitness-api.md` |

The design system followed in its own run of units, numbered afresh from W1, with one journal entry
for the whole run (`journal/261024-design-system.md`):

| Units   | What                                                           | PR  |
| ------- | -------------------------------------------------------------- | --- |
| W1–W3   | The design system source, the gate and the artifact            | #13 |
| W4      | The app's tokens, fonts and inks                               | #14 |
| W5–W7   | The primitives and the `/styleguide` route                     | #15 |
| W8–W9   | Forms, sign-in, navbar, settings and confirmations             | #16 |
| W10–W12 | The planner on the new marks, keyboard grids, phone Today view | #17 |
| W13–W14 | Lint, CI and e2e enforcement; the design-system docs           | #18 |

Open sign-up (D9–D11) was a third run, numbered afresh from W1, shipped in one pull request with
one journal entry (`journal/261025-email-signup.md`):

| Unit | What                                              | PR  |
| ---- | ------------------------------------------------- | --- |
| W1   | The sign-up endpoint, the email rule and the caps | #23 |
| W2   | The per-user quota                                | #23 |
| W3   | The create-an-account screen and the sign-in copy | #23 |
| W4   | The decision record, docs and journal             | #23 |
