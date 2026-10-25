"""The two emails the API sends, built to the design system's EmailLayout card (docs/api.md §4.1).

Email clients read neither CSS variables nor <style>, so the light theme's token values are
written out here, inline. `python -m fitness_planner_api.emails <path>` writes the card's
preview from this module; a test fails when the committed preview is out of date.
"""

import sys
from dataclasses import dataclass
from html import escape
from pathlib import Path

# tokens.json, light theme.
CANVAS = "#faf8f3"
PANEL = "#fffefb"
LINE = "#e4dfd5"
INK = "#1f1d1a"
ON_INK = "#faf8f3"
INK_SECONDARY = "#5f5a52"
SERIF = "'Source Serif 4', Georgia, 'Times New Roman', serif"
SANS = "'Source Sans 3', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"

HOUR, DAY = 3600, 86_400
WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]


@dataclass(frozen=True)
class Email:
    subject: str
    html: str
    text: str


def _count(n: int, unit: str) -> str:
    number = WORDS[n] if n < len(WORDS) else str(n)
    return f"{number} {unit}{'' if n == 1 else 's'}"


def duration(seconds: int) -> str:
    """A lifetime in words, as the voice guide writes small numbers: "seven days", "one hour"."""
    if seconds % DAY == 0:
        return _count(seconds // DAY, "day")
    if seconds % HOUR == 0:
        return _count(seconds // HOUR, "hour")
    return _count(max(1, seconds // 60), "minute")


def _p(text: str, colour: str = INK, size: str = "16px/24px", gap: str = "16px") -> str:
    return f'<p style="margin:0 0 {gap};font:400 {size} {SANS};color:{colour};">{text}</p>'


def layout(
    heading: str, lines: list[str], action: str, url: str, note: str, footnote: str, host: str
) -> str:
    """The EmailLayout card: wordmark, a panel with the heading, the text, one button, the
    link written out for clients that block buttons, then the small print. Plain text in, so
    everything is escaped here."""
    link = escape(url, quote=True)
    body = "".join(_p(escape(line)) for line in lines)
    return (
        '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        '<meta name="color-scheme" content="light"><meta name="supported-color-schemes" '
        f'content="light"><title>{escape(heading)}</title></head>'
        f'<body style="margin:0;padding:0;background:{CANVAS};">'
        f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
        f'style="background:{CANVAS};"><tr><td align="center" style="padding:32px 16px;">'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
        'style="max-width:560px;">'
        f'<tr><td style="padding:0 0 16px;font:600 20px/26px {SERIF};color:{INK};">'
        "Fitness Planner</td></tr>"
        f'<tr><td style="padding:32px 24px;background:{PANEL};border:1px solid {LINE};'
        'border-radius:10px;">'
        f'<h1 style="margin:0 0 16px;font:600 26px/32px {SERIF};color:{INK};">'
        f"{escape(heading)}</h1>"
        f"{body}"
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" '
        'style="margin:8px 0 24px;"><tr>'
        f'<td style="background:{INK};border-radius:6px;">'
        f'<a href="{link}" style="display:inline-block;padding:10px 16px;'
        f'font:600 16px/24px {SANS};color:{ON_INK};text-decoration:none;border-radius:6px;">'
        f"{escape(action)}</a></td></tr></table>"
        + _p(escape(note), INK_SECONDARY, "14px/20px", "8px")
        + _p(
            "If the button doesn’t work, paste this link into your browser:",
            INK_SECONDARY,
            "14px/20px",
            "4px",
        )
        + f'<p style="margin:0;font:400 14px/20px {SANS};word-break:break-all;">'
        f'<a href="{link}" style="color:{INK};text-decoration:underline;">{link}</a></p>'
        "</td></tr>"
        f'<tr><td style="padding:16px 0 0;font:400 14px/20px {SANS};color:{INK_SECONDARY};">'
        f"{escape(footnote)}<br>Fitness Planner · {escape(host)}</td></tr>"
        "</table></td></tr></table></body></html>"
    )


def _text(heading: str, lines: list[str], url: str, note: str, footnote: str) -> str:
    return "\n\n".join([heading, *lines, url, note, footnote]) + "\n"


def _host(origin: str) -> str:
    return origin.split("://", 1)[1]


def confirm(origin: str, token: str, lifetime: int) -> Email:
    url = f"{origin}/#/confirm/{token}"
    heading = "Confirm your email"
    lines = [
        "You created a Fitness Planner account with this address. Confirm it, so a password "
        "reset can reach you here."
    ]
    note = f"The link works for {duration(lifetime)}."
    footnote = "If you didn’t create this account, you can ignore this email."
    return Email(
        subject="Confirm your email for Fitness Planner",
        html=layout(heading, lines, "Confirm email", url, note, footnote, _host(origin)),
        text=_text(heading, lines, url, note, footnote),
    )


def reset(origin: str, address: str, token: str, lifetime: int) -> Email:
    url = f"{origin}/#/reset/{token}"
    heading = "Choose a new password"
    lines = [
        f"Someone asked to reset the password for {address}. If it was you, choose a new one "
        "with this link."
    ]
    note = (
        f"The link works once, for {duration(lifetime)}. Choosing a password signs you out on "
        "your other devices."
    )
    footnote = "If you didn’t ask, ignore this email. Your password stays as it is."
    return Email(
        subject="Reset your Fitness Planner password",
        html=layout(heading, lines, "Choose a new password", url, note, footnote, _host(origin)),
        text=_text(heading, lines, url, note, footnote),
    )


# A real-length token (secrets.token_urlsafe(32) is 43 characters), so the card shows the wrap.
# Plainly fake, so secret scanners don't take it for one.
SAMPLE_ORIGIN = "https://fitness.itsa-pizza.com"
SAMPLE_TOKEN = "sample-link-token-for-the-card-preview-0000"  # noqa: S105 (not a secret)
MARKER = (
    '<!-- @dsCard group="Feedback" height=1720 subtitle="The two emails, confirm and reset:'
    ' inline styles, light only" -->'
)


def card() -> str:
    """The EmailLayout card's preview.html: both emails, one after the other, as sent."""
    emails = [
        ("Sent at sign-up and from “Send it again”", confirm(SAMPLE_ORIGIN, SAMPLE_TOKEN, 7 * DAY)),
        (
            "Sent from “Forgot your password?”",
            reset(SAMPLE_ORIGIN, "sam@example.com", SAMPLE_TOKEN, HOUR),
        ),
    ]
    parts = []
    for caption, email in emails:
        inner = email.html.split("<body", 1)[1].split(">", 1)[1].rsplit("</body>", 1)[0]
        parts.append(
            f'<p style="margin:0;padding:24px 16px 0;font:400 14px/20px {SANS};'
            f'color:{INK_SECONDARY};">{escape(caption)}. Subject: {escape(email.subject)}</p>'
            f"{inner}"
        )
    return (
        f'{MARKER}\n<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        "<title>EmailLayout — preview</title>\n</head>\n"
        f'<body style="margin:0;background:{CANVAS};">\n'
        + "\n".join(parts)
        + "\n</body>\n</html>\n"
    )


if __name__ == "__main__":
    Path(sys.argv[1]).write_text(card(), encoding="utf-8")
