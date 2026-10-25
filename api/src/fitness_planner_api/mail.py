"""Sending email through Resend's HTTP API (docs/api.md §4.1)."""

import json
import logging
import urllib.error
import urllib.request
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any, Protocol

log = logging.getLogger(__name__)

RESEND_URL = "https://api.resend.com/emails"
TIMEOUT = 10.0


@dataclass(frozen=True)
class Message:
    to: str
    subject: str
    html: str
    text: str
    #: `confirm` or `reset`, for the log and Resend's tags; never the address.
    kind: str
    #: Resend drops a repeat of a request with this key for 24 hours, so one can't send twice.
    key: str


class MailError(Exception):
    pass


class Mailer(Protocol):
    def send(self, message: Message) -> None: ...


Opener = Callable[..., Any]


class ResendMailer:
    def __init__(self, api_key: str, sender: str, opener: Opener = urllib.request.urlopen) -> None:
        self._api_key = api_key
        self._sender = sender
        self._open = opener

    def send(self, message: Message) -> None:
        body = {
            "from": self._sender,
            "to": [message.to],
            "subject": message.subject,
            "html": message.html,
            "text": message.text,
            "tags": [{"name": "kind", "value": message.kind}],
        }
        request = urllib.request.Request(
            RESEND_URL,
            data=json.dumps(body).encode(),
            method="POST",
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
                "Idempotency-Key": message.key,
                "User-Agent": "fitness-planner-api",
            },
        )
        try:
            with self._open(request, timeout=TIMEOUT) as response:
                response.read()
        except urllib.error.HTTPError as e:
            raise MailError(f"Resend answered {e.code}: {e.read()[:200]!r}") from None
        except OSError as e:
            raise MailError(f"Resend unreachable: {e}") from None


def send_quietly(mailer: Mailer, message: Message) -> None:
    """Send after the response has gone: a failure is logged, never shown to the person."""
    try:
        mailer.send(message)
    except MailError as e:
        log.warning("%s email not sent: %s", message.kind, e)
