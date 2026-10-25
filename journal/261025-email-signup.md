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
- **Guardrails.** `MAX_USERS` (default 50; 0 closes sign-up, leaving invites) counts every account;
  at most 10 sign-ups land in any rolling hour (invites do not count); every account may store 5 MiB (plans' JSON plus 64 bytes a tick row). The
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

## 4. Wrap-up review

A fresh code review found no way past the caps or the quota and no regression (confirmed by
reading; the suites are green). It suggested, and this change made, a specific notice when a
plan or tick write is refused for quota ("Your account is full, so it was undone here"), in
place of the generic "refused" one. A separate documentation audit against the shipped code found
the hourly limit misdescribed (only sign-ups count, not invites), "0 = off" for `MAX_USERS`
(it closes sign-up), and two unrecorded risks, now in `docs/api.md` §8: anyone can claim an
email that is not theirs, and a disabled account still counts towards `MAX_USERS` because there
is no delete.

## 5. What is deliberately not done

- No email is sent, so no verification and no "forgot password"; resets stay `fp-admin reset`.
- No CAPTCHA or per-IP limit: the LAN port means no client IP can be trusted.
- No `fp-admin delete`; a squatted or unwanted account can be disabled or reset, not removed.
- The quota counts 64 bytes a tick row, which understates disk use for long item ids. It bounds
  growth, which is its job; it is not a disk budget.

## 6. Deploying

Sign-up opens the moment the new API image runs: the default `MAX_USERS` is 50. Set
`MAX_USERS: '0'` on the production API first to keep invites-only until wanted. The Design System
artifact needs republishing from `brand/design-system/` once this merges.
