# Transactional email

> Purpose
>
> Why the planner now sends email, how the two emails and their limits work, what the reviews
> changed, and what is left before the first one goes out.

## 1. The decision

Sign-up (D9–D11, earlier the same day) used the email only as a login name, so a forgotten password
needed `fp-admin reset`. Issue #27 asked which transactional email provider to use. John looked
at the options, chose Resend, supplied a send-only API key, and asked for two emails: confirm
your email and password reset. Monthly progress reports come later (issue #29). The rest were
Claude's calls, stated before the build: the sender on an `updates.` subdomain in the EU region,
new accounts signed in at once with a banner until they confirm, sign-up still saying when an email
is taken, a one-hour mailed reset, and the limits. They are D12–D14 in `docs/decisions.md`; the
"no mail" half of D10 is superseded.

## 2. How it works

- **Off without a key.** `RESEND_API_KEY` turns mail on and requires `MAIL_FROM`. Without it the
  API behaves as before: no banner, no "Forgot your password?", and the routes that send answer
  503 `mail-off`. `GET /api/auth/options` tells the sign-in screen which it is.
- **Resend through the standard library.** `mail.py` posts to `https://api.resend.com/emails` with
  `urllib`: no new dependency. Every send runs as a FastAPI background task after the response,
  so Resend's latency never shows and a failure is only logged (kind, never the address).
- **Schema 3.** `users.email_confirmed_at`, `invites.mailed`, a `confirmations` table for the
  confirm links and `mail_log` for the limits. Accounts from before start unconfirmed.
- **Confirm.** Sign-up sends `#/confirm/<token>`, valid 7 days; `ConfirmEmail.vue` uses it, signed
  in or out. Until then `EmailStatus.vue` shows a neutral Banner, "Confirm your email.", with
  "Send it again".
- **Forgot.** `#/forgot` (`ForgotForm.vue`) posts an email and always answers that a link is on
  its way if there is an account. The link is the existing `#/reset/<token>` with a one-hour
  lifetime; using it also confirms the address, since only the inbox's owner could open it.
- **Limits.** Per account and kind one email a minute and five a day, and `MAIL_PER_HOUR` (30)
  across the API, checked and logged under the write lock before the link is minted.
- **The emails** come from `emails.py`, built to a new EmailLayout card (inline styles, tables,
  light only, the link written out). The card's preview is generated from the same code, and a test
  fails when they differ, so the design system and what people receive cannot drift. `voice.md`
  gained an Email section, and the Banner, TextLink, Panel and Icons cards gained the new states;
  a `mail` icon joined the set.

## 3. What review changed

A code review and a separate documentation audit ran before the pull request.

- **`MAIL_PER_HOUR=0` crashed** the limit check with an `IndexError`, so a reset request for a real
  account answered 500 where an unknown one answered 202: an enumeration leak, and a sign-up that
  created the account but returned 500. The setting now has to be at least 1.
- **A stranger could cancel someone's reset link** by asking for another: minting revoked earlier
  links. A mailed reset now revokes nothing (an `fp-admin` link still revokes earlier `fp-admin`
  links), so a link already sent keeps working for its hour.
- **The wait message** said "An email went a moment ago", which is wrong when the five-a-day or the
  whole planner's hourly limit is what stopped it. It is now "Can’t send another email yet. Try
  again in ten minutes.", true for all three.
- The audit also fixed a dozen doc claims: the forgot route's 202 is for a well-formed email,
  `mail_log` counts attempts not deliveries, the confirm route works with mail off, the subdomain's
  DNS record names carry the subdomain, and the brand doc's exception for the email card covers its
  preview rule too. The 2026-10-24 brand spec still says the app sends no email; it is a
  point-in-time spec, so it stays as written.
- Accepted on purpose, in `api.md` §8: sign-up still says when an email is taken; whoever holds
  an inbox can reset its password; strangers can spend the limits (links already sent keep
  working); a real account's reset request may answer a few milliseconds slower; Resend sees the
  addresses and links.

## 4. Before the first email

The app ships with mail off. Three steps remain, in order:

1. In Resend, add `updates.itsa-pizza.com` (region eu-west-1) and put its DKIM, MX and SPF records
   in Cloudflare as DNS only. The key John gave can only send, so it cannot add or verify a domain.
2. The home-server change (the vault entry `vault_resend_fitness_api_key`, an env file, and a
   `fitness-egress` network: `fitness-api` sat on an internal network with no route out, so it
   could not have reached Resend) ships with `infra_vm_fitness_mail: false`.
3. Once the domain is verified, set it to true and run `make infra t=fitness`. `GET
   /api/auth/options` then answers `{"mail": true}`.

The key was pasted into the chat, so it sits in that transcript; a fresh sending-only key limited
to the domain, swapped into the vault, would retire this one.

## 5. Checks

API: ruff, mypy strict, pytest with 100% line coverage (branch 99%). Web: vitest (705 tests after rebasing onto #30–#32, the
coverage thresholds), vue-tsc, oxlint, eslint, Prettier, a production build, and the Playwright
axe and 375px suites with the forgot, confirmed and banner screens added. The design-system gate
passes with `--complete`, now checking EmailLayout's preview for `<style>`, `var()` and images
without alt text.
