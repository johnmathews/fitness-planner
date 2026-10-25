The one layout every email from Fitness Planner uses: the name, a panel with a heading, a sentence or two, one button, the link written out, then the small print.

## Use

- Two emails use it today: "Confirm your email" (sent at sign-up and from the banner's "Send it again") and "Choose a new password" (sent from "Forgot your password?"). Their words are in `voice.md`, under Email.
- Layout, top to bottom on `canvas`: "Fitness Planner" in the serif at 20/26 weight 600 (text, not the wordmark image, which many clients block); a `panel` with a 1px `line` border, `radius-lg` and 32px by 24px padding, at most 560px wide; inside it the heading in `title-1` (26/32 serif 600), the sentences in `body`, one primary button (`ink` fill, `on-ink` text, `radius-md`, 44px tall), then in `caption` and `ink-secondary` how long the link works and "If the button doesn’t work, paste this link into your browser:" above the link itself, in `ink`, underlined, breaking anywhere (`word-break: break-all`) so a long token never widens the email. Below the panel, in `caption` and `ink-secondary`, what to do if it wasn't them, and "Fitness Planner · fitness.itsa-pizza.com".
- Light only. Email clients don't read CSS variables, `<style>` or media queries reliably, so the light theme's values are written inline, the `color-scheme` meta says light, and nothing depends on a dark theme. The gate checks the preview has no `<style>`, `<link>`, `<script>` or `var()`, and that every image has alt text (there are none).
- Tables for layout (`role="presentation"`), so old clients keep the structure.
- Every email also goes as plain text: the same sentences, the link on its own line.

## States

- No hover or focus states: a mail client draws its own.
- A client that blocks buttons, or images, still shows the heading, the sentences and the written-out link.

## You provide

- Generated, not hand-written: `api/src/fitness_planner_api/emails.py` builds both emails and writes this preview (`uv run python -m fitness_planner_api.emails <this file>`, from `api/`). A test fails when the preview here differs from what the code sends, so change the code and regenerate; never edit the preview by hand.
- The heading, the sentences, the button's label (a verb phrase: "Confirm email", "Choose a new password"), the link, how long it works, and the small print. Plain text: the layout escapes it.
