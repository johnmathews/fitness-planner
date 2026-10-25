# Email-only accounts

> Purpose
>
> Why every account is now an email, how the one username account was moved, and what stays for
> accounts from before.

## 1. What happened

Right after email went live, John tried "Forgot your password?" with his own address and got
nothing. The API was working: the request arrived and got its 202, but no account had that email.
The planner's only account was `john`, from an `fp-admin invite` on 2026-10-24, and invited accounts
were named by a username with no address. The forgot form answers the same either way on purpose,
so from the screen it looked like a send.

John asked for two things: give `john` his email, and drop usernames altogether. That is D15 in
`docs/decisions.md`, superseding D11.

## 2. The rename

On the server, after a `VACUUM INTO` copy (`/data/backup/fitness-before-email-rename-*.db`), one
`UPDATE users SET username` inside `BEGIN IMMEDIATE` renamed `john` to the email, checked to touch
exactly one row. Plans, marks and settings are keyed by `user_id`, so nothing else moved. Each
device signs in again: its tabs send `X-Expected-User: john`, which the API now refuses. A reset
request for the new name was then logged in `mail_log` with no failed-send warning.

## 3. The change

- **Invites take an email.** `fp-admin invite <email>` applies sign-up's email rule and lower-cases
  it (the shared `auth.normal_email`); the old username rule is gone. The CLI's argument reads
  `email`.
- **The hourly sign-up limit** used to tell sign-ups from invites by the `@` in the name, which
  every account now has. It now leaves out accounts made from a used invite.
- **A first confirm link at sign-in.** An unconfirmed account that has never been sent a
  confirmation gets one when it signs in, redeems an invite or signs up. Without it, a renamed or
  invited account would see the banner's "The link is in the email sent to…" with no email sent.
- **The screens say "Email".** The sign-in field is "Email" (`inputmode="email"`, not
  `type="email"`, so a legacy username elsewhere can still be typed), the failed sign-in reads
  "Wrong email or password. Check them and try again.", and the forgot form lost its "Signed in
  with a username?" hint. The copy changed in `voice.md` and the TextField and InlineMessage cards
  first.
- **Kept on purpose:** the `users.username` column and the API's `username` field, so tabs and
  clients from before keep working through the deploy, and sign-in for a legacy username account.

## 4. Checks

API: ruff, mypy strict, pytest at 100% line coverage. The tests' invited names became emails, two
deliberately invalid sign-up cases were kept invalid by hand, and new tests cover email invites,
lower-casing, a legacy username still signing in, invited accounts outside the hourly limit, and
the first confirmation (once, never for a confirmed account). Web: vitest 705, vue-tsc, oxlint,
eslint, Prettier; Playwright 38; the design-system gate.
