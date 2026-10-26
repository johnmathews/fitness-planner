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
| D10 | Email   | The email is only a login name, stored lower-cased in `users.username`. No mail is sent: no verification, no self-service reset (the "no mail" part superseded by D12–D14)                  | Verification and "forgot password" by mail, which need a mail provider; a separate `email` column |
| D11 | Sign-in | One field takes an email or a username, since both live in the same column (superseded by D15)                                                                                              | Email only, which would strand invited users until each had an email attached                     |

D9 supersedes D1, and with it the premise behind two accepted risks in [api.md](api.md) §8: the
unbounded per-user data (now the quota) and an account count bounded only by invites (now
`MAX_USERS` and the hourly limit). John chose all three on 2026-10-25.

### 2.3 Email only (2026-10-25)

| ID  | Topic    | Decision                                                                                                                                                                                                                         | Rejected                                                                           |
| --- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| D15 | Accounts | Every account is an email: invites name one (`fp-admin invite <email>`), sign-in asks for "Email", and the app never says "username". An account from before keeps its username and signs in with it, until renamed to its email | Keeping usernames for invites (D11); a separate `email` column beside the username |

John asked for it on 2026-10-25, after a "Forgot your password?" for his own email found nothing:
his account was the invited `john`, which had no email. It was renamed to his email the same day.
Every account then has an address for resets, confirmation and, later, monthly reports (#29).

### 2.2 Transactional email (2026-10-25)

| ID  | Topic      | Decision                                                                                                                                                                                                        | Rejected                                                                                                     |
| --- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| D12 | Provider   | Resend's HTTP API, called with the standard library, from `fitness.itsa-pizza.com`, the app's own subdomain. A send-only key in the home-server vault turns it on; without one, mail is off and nothing changes | Self-hosted SMTP from infra-vm (a residential IP); a provider SDK as a dependency                            |
| D13 | Confirming | Sign-up still signs in at once and still says when an email is taken. A link confirms the address; until then a banner asks, and nothing else is limited                                                        | Holding the account until confirmed, which would also hide taken emails but makes everyone wait for an email |
| D14 | Resets     | "Forgot your password?" emails a one-hour reset link, answering the same for every address; using it confirms the email. Mail is rate-limited per account and across the API                                    | Reset by `fp-admin` only                                                                                     |

John chose Resend on 2026-10-25 and asked for password-reset and confirm-your-email emails. The
sending domain, `fitness.itsa-pizza.com`, is the one he set up in Resend. The rest of D12–D14
(signing in before confirming, keeping the `exists` answer, the one-hour lifetime and the limits)
were Claude's calls, stated to him before the build.
Monthly progress reports, which will use the confirmed addresses, are issue #29.

## 3. Made while planning and building (2026-10-24)

| ID  | Decision                                                                                                                                                 | Why                                                                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| P1  | One export format (`fitness-planner-export` v1) for the file, `GET /api/export` and `POST /api/import`                                                   | One validator per language, one set of fixtures                                                                   |
| P2  | Import always merges and never deletes: existing weeks keep their plan, ticks are OR-ed, settings apply only when there are none                         | No import, anywhere, can destroy data                                                                             |
| P3  | The theme is never exported or synced                                                                                                                    | It belongs to the device; `public/theme-init.js` reads it before first paint                                      |
| P4  | Invite and reset tokens travel in the URL fragment, then in request bodies, never in a path                                                              | No access log (Traefik, nginx, uvicorn) records them                                                              |
| P5  | The CLI fixes the account's name (an email since D15) when it mints an invite                                                                            | A leaked link cannot claim an arbitrary name                                                                      |
| P6  | Every write must carry `Origin` equal to `PUBLIC_ORIGIN` and a JSON body                                                                                 | `SameSite=Lax` alone treats other `*.itsa-pizza.com` hosts as same-site                                           |
| P7  | A plan create whose items match the stored plan succeeds instead of conflicting                                                                          | A first tick creates the week's plan, and two devices do that from the same source                                |
| P8  | Argon2 at its defaults, one hash at a time, a bounded login queue, and the API's own memory limit (160m, measured)                                       | One hash takes 64 MiB, the web container's whole limit                                                            |
| P9  | Synced data lives in new per-user cache keys; the keys from before accounts are never written                                                            | The old data survives untouched, for the first-login import                                                       |
| P10 | nginx forwards to the host `fitness-api:8000`                                                                                                            | The production compose file names the service to match                                                            |
| P11 | Invite links last 7 days; reset links 24 hours                                                                                                           | John, at the planning gate                                                                                        |
| P12 | Sessions last 90 days from last use, refreshed at most daily; logout ends one, a reset ends all                                                          | John, at the planning gate                                                                                        |
| P13 | The home-server deployment (W5) is part of this work, not a hand-off                                                                                     | John, at the planning gate                                                                                        |
| P14 | Every request names its user (`X-Expected-User`), and the API refuses any other                                                                          | A tab left open as one person must never touch the account of someone who signed in later on the same browser     |
| P15 | Writes become operations by diffing the stores against the state the server is known to hold, rather than one API call per store action                  | Every write path, present and future, syncs without extra code                                                    |
| P16 | Tabs share the cache and outbox through `localStorage` events, not a `BroadcastChannel`                                                                  | The cache is in `localStorage` already; one channel instead of two                                                |
| P17 | Sign-out is refused while offline                                                                                                                        | The session cookie is HttpOnly, so only the server can end it                                                     |
| P18 | Imports, from a file or the first-login prompt, merge on the server in one request                                                                       | One transaction against the account's real state, not one write per tick                                          |
| P19 | The phone's choice between Today and Week is kept per device in `localStorage` (`fitness-planner-view-v1`), never synced or exported (superseded by K26) | Like the theme (P3), it suits the screen, not the person. The phone still opens on Today until someone picks Week |

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
| K5  | Below 640px the app opens on a Today list, and the week grid's name column is sticky (superseded by K26)                                                                                                                    | On a phone today's column sat off-screen (F1). Supersedes "the grid scrolls sideways, as designed" in architecture.md §5                                             |
| K6  | Notes on an exercise or a set are a separate feature, built after the system. The system supplies NoteMark and NoteEditor                                                                                                   | Keeps this work to the look, while giving notes a designed home                                                                                                      |
| K7  | "Have fun. Avoid injury. Don't stop." stay principles in the brand spec and never appear in the UI                                                                                                                          | A slogan on screen is the kind of gimmick the brand rules out                                                                                                        |
| K8  | The primary action colour is `ink`, not a brand blue                                                                                                                                                                        | One colour for "act", and the `pen` for "done"                                                                                                                       |

### 4.1 Three kinds of mark (2026-10-25)

Asked for by the owner on a phone screenshot: green for a day done well, amber for part of one, red
for a day tried and not managed, with a press stepping through them.

| ID  | Decision                                                                                                                                                                                                                                                                             | Why                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| K9  | A day's mark is great, partial or missed, and every kind counts towards the goal, the Picked row and the Today summary (the Picked row and Today summary superseded by K28 and K26)                                                                                                  | Showing up is what the planner records; a hard day tried still counts (the owner's call)                                   |
| K10 | Each kind has its own shape and its own fixed pen: a full squiggle in `pen` (green), a half squiggle in `pen-partial` (amber), a cross in `pen-missed` (red). The Ink setting is removed (shapes superseded by K15)                                                                  | Colours that carry meaning can't be a personal choice, and shape keeps the kinds apart without colour. Supersedes K3       |
| K11 | A press steps an exercise's day empty, great, partial, missed, empty; a food has one kind, eaten or not (superseded by K17: a press now steps through each drawing too)                                                                                                              | "Partly ate vegetables" means little (the owner's call)                                                                    |
| K12 | A day is stored as `null`, `"great"`, `"partial"` or `"missed"`. The export file is version 2 and version 1 still imports (`true` reads as great). Import keeps a marked day's mark and fills an empty one from the file (export version 3 since K17; versions 1 and 2 still import) | Old data, caches, outboxes and files carry over as great days. Supersedes P1's version and P2's "ticks are OR-ed"          |
| K13 | The stored accent stays in the settings, the API and the export, but nothing draws it or changes it                                                                                                                                                                                  | No change to the API's settings or the parity fixtures for a value that now means nothing. Amends K3a                      |
| K14 | The cache and outbox keys went from `-v1` to `-v2` with the marks; sign-in moves a `-v1` cache and merges a `-v1` outbox, and a change to either format takes the next version                                                                                                       | A tab still open on the old code emptied every newer tab's boxes through their shared cache. Found on 2026-10-25 in Chrome |

### 4.2 Marker fills (2026-10-25)

Asked for by the owner with a photo of three boxes filled in with a marker: an open zigzag, a solid
fill and a dense hatch, "good enough" to replace the squiggles.

| ID  | Decision                                                                                                                                                                                                                                                                                                                                                                     | Why                                                                                                                                                                        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K15 | A marked day fills its box with one of three drawings traced from the photo (open zigzag, solid, dense hatch), picked from the row and the date. The drawing carries no meaning; the pen alone says great, partial or missed, and the accessible name adds "partly done" or "couldn't do it". The box is drawn over the fill (the pick by row and date is superseded by K17) | The owner's call: the grid should look filled by hand on a whiteboard. Someone who can't tell green from red sees only "marked", an accepted cost. Supersedes K10's shapes |
| K16 | Print is the light theme on white paper from either theme: words, boxes and marks keep their light colours, the surfaces and today's band go transparent                                                                                                                                                                                                                     | With K15 the kinds differ only by colour, so a black print would lose them; the owner wants paper to look like the app. Supersedes print as black on white                 |

### 4.3 Chosen drawings, a sunny yellow, bigger marks and type (2026-10-25)

Asked for by the owner after K15 went live: choose the drawing by pressing, a much more cheerful
yellow than the mustard, a zigzag truer to the photo, and a whiteboard feel: boxes 50% bigger and
larger, easier type ("in the gym with a whiteboard", not delicate).

| ID  | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Why                                                                                                                                                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K17 | The drawing is the person's: a press steps drawing first (great, partial, missed in the zigzag, then the solid, then the hatch, then empty; a food steps green through each drawing). A mark is stored as its kind plus a drawing suffix (`great`, `partial-solid`, `missed-hatch`); the plain kinds are the zigzag, so every older mark reads unchanged. The API adds `solid` and `hatch` masks (schema 4) and the export is version 3. The drawings are traced from the photo's ink as filled outlines | The owner's call, and the order ("drawing first") is theirs. A suffix keeps every stored value, fixture and older file valid. Tracing the ink keeps the zigzag the owner drew; the hand-drawn polyline did not |
| K18 | `pen-partial` is a sunny yellow, `#f2b300` (`#f5c518` in dark), at 1.5–1.9:1 on the light grounds; the gate holds it to 1.5:1. Today's band becomes a neutral warm grey (`#ece7dd`, `#34312c`), and `control-border` goes to `#888175` to keep the box at 3:1 on it                                                                                                                                                                                                                                      | The owner chose cheer over the 3:1 a mark should reach; the box drawn over every mark keeps a yellow day findable. A yellow band would swallow yellow marks                                                    |
| K19 | Marks 50% bigger (a 45px box, a 64px button, a 76px cell; 72px in the Today list) and the type scale a step up (`body` 18/26, `caption` and `label` 16/22, `body-large` 20/28, `title-2` 22/28, `title-1` 30/36, `display` 44/48)                                                                                                                                                                                                                                                                        | "In the gym with a whiteboard": less white space round each box, and words readable at arm's length. The grids' minimum widths grow to fit (748px and 828px)                                                   |

### 4.4 Mark sets and brighter dark pens (2026-10-25)

Asked for by the owner: a choice in Settings between kinds of mark, each still in the three pens,
with ticks and faces besides the squiggles. Decided on the mockup
`brand/design-system/mockups/261025-mark-styles` over three rounds.

| ID  | Decision                                                                                                                                                                                                                                                                                                                                                                                                     | Why                                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K20 | Settings, Appearance, offers five mark sets as a radio list (RadioCard): Squiggles (the default, K17's drawings), Ticks (a tick, a circle, a cross), Stamped ticks, Faces (happy, so-so, sad) and Stamped faces. Ticks and faces are marker strokes in the pen with the box drawn over them; stamped sets colour the box solid and leave the symbol in paper. The set is the device's choice, like the theme | The owner's picks: marker strokes (1A), stamped as a set of its own (1C), a row per set (2B), and circles rather than tildes for partly done. A shape per kind also tells the kinds apart without colour |
| K21 | The set changes only how a mark is drawn. A day keeps its stored mark, so its squiggle drawing comes back on switching back. In a tick or face set a press steps an exercise's day empty, great, partial, missed, empty, and a food's empty, great, empty, storing the plain kinds; a squiggle drawing already there steps on from its kind                                                                  | A symbol set has one drawing per kind, so stepping through drawings would show the same mark three times. Nothing new is stored, so the API, exports and other devices are unchanged                     |
| K22 | The dark theme's pens are vivid: `pen` `#3fd273`, `pen-partial` `#ffc21a`, `pen-missed` `#ff5c4d`. The light theme's pens are unchanged                                                                                                                                                                                                                                                                      | The owner wanted dark mode "brighter and more vibrant" and picked Vivid (A) over Bright and Neon. Every pair the gate measures still passes                                                              |
| K23 | Stamped sets leave the symbol in `canvas` on the pen: on light `pen-partial` that is 1.8:1, below the 3:1 a symbol should reach. The gate holds it to 1.5:1                                                                                                                                                                                                                                                  | The owner kept stamped knowing the measure, as with K18's yellow; the yellow box is still findable and the name says "partly done"                                                                       |

### 4.5 A full-screen week (2026-10-25)

Asked for by the owner: the planner as one interface with one job, after the timer app. The week
fills the screen, the bar keeps out of sight, and scrolling brings Food, which takes the screen in
turn. Decided on the mockup `brand/design-system/mockups/261025-full-screen-week`: A and P2.

| ID  | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Why                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K24 | Exercises and Food are a screen each, and the scroll snaps to each. The grid fills its screen: sizes follow the screen (1 at 1280×800, from 0.75 to 1.6 times), a day box is 86% of its cell's shorter side up to 128px, and no text drops below 16px. A tall screen centres the week; more rows than fit stop at 56px and the screen runs longer. A desktop, an iPad on its side and a phone on its side get the same screen; a screen 540px tall or less moves the title into the grid's corner and drops the chips (the snapping superseded by K38) | The owner's brief: "the main thing" clear at arm's length, as in the timer, on every device he named                                                                                        |
| K25 | The bar is out of sight until it is wanted: a 14px strip along the top edge for a pointer, a handle at the top centre for a finger (pressed or pulled down), and focus inside it. It hides when the pointer leaves, on Escape and on a press elsewhere. Each screen opens with a title line: its name, the week and its figure. A "Food" button at the foot of the first screen leads on (the figure superseded by K31)                                                                                                                                | Option A over B (the title in the grid's corner) and C (a quiet bar that never hides). The title line keeps the SectionHeader card, and the button says there is more                       |
| K26 | Held upright (portrait, under 1000px wide) the week folds: each row's name, chips and total on one line, its seven boxes beneath, today's band unbroken down its column. A phone opens on the week. The Today list and its Today \| Week switch are removed. Supersedes K5 (the total superseded by K33, the band by K36)                                                                                                                                                                                                                              | Option P2 over P1 (the Today list grown to fill the screen): one interface on every screen. An iPad held upright folds too, since 820px is too narrow for seven roomy days beside the names |
| K27 | Edit plan and the Settings page keep the bar in view and the page scrolling freely, with no snapping: the forms need the room, and the controls are the point there. Print is unchanged                                                                                                                                                                                                                                                                                                                                                                | A call made while building, open to veto. A snapped screen can't hold the add forms beneath the grid                                                                                        |

Round 2, from the owner's comments on the mockup:

| ID  | Decision                                                                                                                                                                                                                         | Why                                                                                                                                |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| K28 | The WeekGrid has no Picked row: nothing counts a day's exercises against the daily pick on screen or on paper. The daily pick stays in the settings, the API and the export, and Settings still sets it (K30 gives it a new use) | "lets remove this row completely". The SectionHeader's figure already counts the week                                              |
| K29 | The day headers show the day's name alone ("Mon"), with no day of the month. The date stays visually hidden for a screen reader, and each DayMark's name says the full date                                                      | "lets remove the day-of-the-month number and just keep the day name abreviation". The week beside each title says which week it is |

Round 3, from the owner's answers:

| ID  | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Why                                                                                                                                                                                                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K30 | A day whose marked exercises reach the daily pick turns green: its name in `pen` with a check, and its column, header to last row, in a new role, `pen-wash` (`#e8f2ea`, `#1e3325` in dark). Today keeps its `highlight` band, and its name stays `ink` beside the `pen` check. A screen reader hears "daily goal met" with the day. Foods have no daily pick, so Food never shows it. The daily pick stays in Settings ("Exercises a day"). This settles K28's open question (the wash superseded by K35, then K39) | "when the user achieves their exercises per day goal, there should be some visual affirmation - such as the column or text going green." Option G2 over G1 (the name alone) and G3 (the header stamped green). The mockup's wash, `#e3efe6`, put the green name at 4.3:1; one step lighter reaches 4.5:1. `pen` on today's band is 4.2:1, so today's name stays ink |
| K31 | The sections have no weekly figure: "15 of 15 this week" and "0 of 4 goals met" are gone, and with them the StatFigure component. Each row's "3 of 4" total stays                                                                                                                                                                                                                                                                                                                                                    | "lets remove this element completely", for both sections                                                                                                                                                                                                                                                                                                            |
| K32 | Settings has no "Show weekly totals" switch, since it hid only those figures. A stored `showTotals` is ignored                                                                                                                                                                                                                                                                                                                                                                                                       | The owner's call: remove it, rather than have it hide the Week column                                                                                                                                                                                                                                                                                               |

Round 4, from the owner's comments:

| ID  | Decision                                                                                                                                                                                                           | Why                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| K33 | The WeekGrid has no Week column: no row total ("3 of 4") on screen or on paper. A row's goal shows only in its Edit dialog. The totals are still counted by the stores                                             | "lets remove this column". The marks and the days that turn green carry the week |
| K34 | The Header has a Full screen button after the Edit plan Switch: the browser's full screen for the whole page, with Esc as its other way out. It is left out where the browser has none for a page, as on an iPhone | "lets add a button to the navbar to toggle a full-screen view"                   |

Round 5:

| ID  | Decision                                                                                                                                                                                                                                                                                                | Why                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| K35 | A met day's column has no wash. Instead a 6px `pen` line runs along its foot, under the last row, inset 12% from the column's edges so neighbouring days stay apart. The green name and check stay, and today keeps its band. The `pen-wash` role is removed. Supersedes K30's wash (superseded by K39) | "it is too washed out and weak. lets instead have a simple bold green line at the bottom of the column", in the Stamped tick's green |

Round 6:

| ID  | Decision                                                                                                                                                                                                                                                | Why                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| K36 | Today has no band: every day's column looks alike. Today stays the grid's first tab stop and its header and marks say "today" for a screen reader. The `highlight` role is removed, since the band was its only use. Supersedes the band in K18 and K35 | "we do not need to show which day of the week it currently is we can assume the user will already know what day it is" |
| K37 | The bar stays along the top (option N1). The sidebar (N2) is kept on the mockup only                                                                                                                                                                    | The owner asked to build and push with the bar as built                                                                |

After the release:

| ID  | Decision                                                                                                                                                                                                                                                            | Why                                                                                                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K38 | The page sprints between screens in script instead of CSS snapping. A screen with more rows than fit scrolls as usual; a scroll that comes to rest across the line between two screens moves on in its direction, to the next screen's top or the earlier one's end | The owner: scroll "naturally" within a long tracker, but never "see part of both tracker tables at the same time"; the view should "sprint" from one to the other. A test found `scroll-snap-type: y mandatory` stuck a mouse wheel at the end of a tall screen |
| K39 | A met day's underline is a hand-drawn green marker stroke below the column, one of three in turn, bowed, tapered and uneven, max(18px, 24u) tall. Supersedes K35's straight line                                                                                    | "not thick enough. lets make them slightly curved as if drawn by hand", with "the same irregular organic by-hand aesthetic as the squiggles"                                                                                                                    |
| K40 | A resize or rotation that leaves the page across the line between two screens settles on the screen that fills more of the window (half-way goes to the later one). Nobody scrolled, so there is no direction to follow                                             | The `/done` review found the sprint ran only after a scroll; a test showed a rotation leaving the page across both screens. The owner: "fix the gaps - rotate and resize"                                                                                       |

## 5. Accepted risks

Each is described where it applies:

- the lockout and sign-up reveal which emails have accounts; the lockout can block
  one; sessions have no absolute lifetime; anyone can claim an email that is not theirs until it is
  confirmed; whoever holds an account's inbox can reset its password; Resend sees the addresses and
  links; strangers can fill the account cap or the hourly limit ([api.md](api.md) §8);
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

Transactional email (D12–D14, issue #27) shipped in one pull request with one journal entry
(`journal/261025-transactional-email.md`); the vault entry and the environment that turn it on
are a home-server change.
