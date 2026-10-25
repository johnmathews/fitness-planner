# Email sign-up

> Purpose
>
> Why the planner now lets anyone create an account, what guards it, and what changed along the
> way.

## 1. The decision

Until now accounts came only from `fp-admin invite` links (D1). John asked for a sign-up option on
the sign-in screen, with an email and a password. Three calls were his: open to anyone but with
guardrails, the email used only as a login name (no mail is sent), and one sign-in field that takes
an email or a username. They are D9–D11 in `docs/decisions.md`; D9 supersedes D1.

## 2. How it works

- **No schema change.** A signed-up account's email, trimmed and lower-cased, is stored in
  `users.username`. Invite usernames never contain `@`, so the two kinds cannot collide, and
  sign-in, `X-Expected-User`, the per-user cache keys and every `fp-admin` command work unchanged.
  `fp-admin reset` no longer applies the username rule, so it works for email accounts.
- **Emails are printable ASCII.** The name travels in the `X-Expected-User` header, and `fetch`
  throws on a header value above U+00FF. Checked in Node before choosing the rule.
- **Guardrails.** `MAX_USERS` (default 50, 0 = off) counts every account; at most 10 sign-ups land
  in any rolling hour; every account may store 5 MiB (plans' JSON plus 64 bytes a tick row). The
  caps are checked before the password is hashed, so a closed sign-up costs nothing, and again
  under the write lock, so parallel sign-ups cannot pass them. Sign-ups share the bounded argon2
  queue, so they cannot raise memory use. Writes that keep usage level or shrink it always pass,
  so a full account can still trim itself.
- **The screen.** `#/signup` shows `SignupForm`, built from the system's TextField, Button,
  InlineMessage and TextLink. The copy went into the design system's `voice.md` first, with the
  TextField, InlineMessage, Button and Panel cards and `docs/brand.md` updated to match.

## 3. Found on the way

`request` turned every 409 into a plan conflict, so a sign-up's 409 `exists` would have shown as
"Something went wrong". The component test for a taken email caught it; `api.ts` now treats only a
409 `conflict` as a conflict, with its own test.

## 4. Deploying

Sign-up opens the moment the new API image runs: the default `MAX_USERS` is 50. Set
`MAX_USERS: '0'` on the production API first to keep invites-only until wanted. The Design System
artifact needs republishing from `brand/design-system/` once this merges.
