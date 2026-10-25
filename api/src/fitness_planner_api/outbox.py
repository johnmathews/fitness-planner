"""Which emails go out and when: the limits, the links, and the message (docs/api.md §4.1)."""

import secrets
import sqlite3
from typing import Literal

from . import auth, emails
from .auth import DAY, HOUR, MAX_EMAIL, AuthError
from .config import Config
from .db import transaction
from .mail import Message

MailKind = Literal["confirm", "reset"]
#: Per account and kind: one email a minute, five a day.
GAP = 60
DAILY = 5


def _wait(conn: sqlite3.Connection, config: Config, user_id: int, kind: MailKind, now: int) -> int:
    """Seconds until this account may be sent another email of this kind; 0 means now."""
    waits = [0]
    hour = conn.execute(
        "SELECT sent_at FROM mail_log WHERE sent_at > ? ORDER BY sent_at", (now - HOUR,)
    ).fetchall()
    if len(hour) >= config.mail_per_hour:
        waits.append(hour[len(hour) - config.mail_per_hour]["sent_at"] + HOUR - now)
    day = conn.execute(
        "SELECT sent_at FROM mail_log WHERE user_id = ? AND kind = ? AND sent_at > ?"
        " ORDER BY sent_at",
        (user_id, kind, now - DAY),
    ).fetchall()
    if day:
        waits.append(day[-1]["sent_at"] + GAP - now)
    if len(day) >= DAILY:
        waits.append(day[len(day) - DAILY]["sent_at"] + DAY - now)
    return max(waits)


def _claim(conn: sqlite3.Connection, config: Config, user_id: int, kind: MailKind) -> None:
    """Log a send, or raise `too-soon` with the wait. Checked and logged under one write lock,
    so parallel requests can't both get past a limit."""
    now = config.clock()
    with transaction(conn):
        if wait := _wait(conn, config, user_id, kind, now):
            raise AuthError("too-soon", retry_after=wait)
        conn.execute(
            "INSERT INTO mail_log (user_id, kind, sent_at) VALUES (?, ?, ?)", (user_id, kind, now)
        )


def _message(to: str, kind: MailKind, email: emails.Email) -> Message:
    key = f"{kind}-{secrets.token_urlsafe(16)}"
    return Message(to, email.subject, email.html, email.text, kind, key)


def confirmation(conn: sqlite3.Connection, config: Config, user_id: int) -> Message:
    """The confirm-your-email message for an account, with a fresh link; or AuthError
    `no-email` (an invited account), `confirmed`, or `too-soon`."""
    state = auth.confirmed(conn, user_id)
    if state is None:
        raise AuthError("no-email")
    if state:
        raise AuthError("confirmed")
    _claim(conn, config, user_id, "confirm")
    token = auth.mint_confirmation(conn, config, user_id)
    address = conn.execute("SELECT username FROM users WHERE id = ?", (user_id,)).fetchone()[0]
    lifetime = config.confirm_days * DAY
    return _message(address, "confirm", emails.confirm(config.public_origin, token, lifetime))


def reset(conn: sqlite3.Connection, config: Config, email: str) -> Message | None:
    """The reset message for whoever has this email, or None: nobody does, the account is
    disabled, or a limit is reached. The caller answers the same either way."""
    email = email.strip().lower()
    if len(email) > MAX_EMAIL or not auth.EMAIL_RE.fullmatch(email):
        raise AuthError("email")
    row = conn.execute(
        "SELECT id FROM users WHERE username = ? AND disabled = 0", (email,)
    ).fetchone()
    if row is None:
        return None
    try:
        _claim(conn, config, int(row["id"]), "reset")
    except AuthError:
        return None
    token = auth.mint_link(conn, config, "reset", email, mailed=True)
    lifetime = config.mail_reset_minutes * 60
    return _message(email, "reset", emails.reset(config.public_origin, email, token, lifetime))
