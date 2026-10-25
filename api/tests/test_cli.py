import sqlite3

import pytest

from fitness_planner_api import auth
from fitness_planner_api.cli import main
from fitness_planner_api.config import Config

from .conftest import ORIGIN, Clock

PASSWORD = "correct horse battery"


@pytest.fixture
def env(config: Config) -> dict[str, str]:
    return {"DATA_DIR": str(config.data_dir), "PUBLIC_ORIGIN": ORIGIN}


def run(
    env: dict[str, str], capsys: pytest.CaptureFixture[str], *argv: str
) -> tuple[int, str, str]:
    code = main(list(argv), env, clock=Clock())
    out, err = capsys.readouterr()
    return code, out, err


def link_token(out: str, kind: str) -> str:
    line = next(line for line in out.splitlines() if line.startswith(ORIGIN))
    prefix = f"{ORIGIN}/#/{kind}/"
    assert line.startswith(prefix)
    return line.removeprefix(prefix)


def test_invite_prints_a_link_that_works(
    env: dict[str, str],
    config: Config,
    conn: sqlite3.Connection,
    capsys: pytest.CaptureFixture[str],
) -> None:
    code, out, _ = run(env, capsys, "invite", "alice@example.com")
    assert code == 0
    assert "expires 2026-10-30 08:00 UTC" in out  # 7 days from the pinned clock
    assert auth.link_info(conn, config, link_token(out, "invite")) == (
        "invite",
        "alice@example.com",
    )


def test_reset_disable_enable_and_revoke(
    env: dict[str, str],
    config: Config,
    conn: sqlite3.Connection,
    capsys: pytest.CaptureFixture[str],
) -> None:
    token = auth.mint_link(conn, config, "invite", "alice@example.com")
    uid = auth.redeem(conn, config, token, PASSWORD)
    auth.create_session(conn, config, uid)
    code, out, _ = run(env, capsys, "users")
    assert code == 0
    assert "alice@example.com" in out and "1 session" in out and "active" in out
    code, out, _ = run(env, capsys, "reset", "alice@example.com")
    assert code == 0 and link_token(out, "reset")
    assert (
        run(env, capsys, "revoke-sessions", "alice@example.com")[1].strip()
        == "Ended 1 session for alice@example.com."
    )
    assert run(env, capsys, "disable", "alice@example.com")[0] == 0
    assert "disabled" in run(env, capsys, "users")[1]
    assert run(env, capsys, "enable", "alice@example.com")[0] == 0
    assert "active" in run(env, capsys, "users")[1]


@pytest.mark.parametrize(
    ("argv", "message"),
    [
        (["reset", "nobody"], "no user named 'nobody'"),
        (["disable", "nobody"], "no user named 'nobody'"),
        (["invite", "alice"], "invites name an email address, like name@example.com"),
    ],
)
def test_errors_go_to_stderr_with_status_1(
    env: dict[str, str], capsys: pytest.CaptureFixture[str], argv: list[str], message: str
) -> None:
    code, out, err = run(env, capsys, *argv)
    assert (code, out) == (1, "")
    assert message in err


def test_inviting_an_existing_user(
    env: dict[str, str],
    config: Config,
    conn: sqlite3.Connection,
    capsys: pytest.CaptureFixture[str],
) -> None:
    auth.redeem(conn, config, auth.mint_link(conn, config, "invite", "alice@example.com"), PASSWORD)
    code, _, err = run(env, capsys, "invite", "Alice@example.com")
    assert code == 1 and "already exists; use reset" in err


def test_no_users_yet(env: dict[str, str], capsys: pytest.CaptureFixture[str]) -> None:
    assert run(env, capsys, "users")[1].strip() == "No users yet."


def test_needs_a_public_origin(capsys: pytest.CaptureFixture[str], config: Config) -> None:
    code, _, err = run({"DATA_DIR": str(config.data_dir)}, capsys, "users")
    assert code == 1 and "PUBLIC_ORIGIN" in err


def test_reset_works_for_a_signed_up_email(
    env: dict[str, str],
    config: Config,
    conn: sqlite3.Connection,
    capsys: pytest.CaptureFixture[str],
) -> None:
    auth.signup(conn, config, "bob@example.com", PASSWORD)
    code, out, _ = run(env, capsys, "reset", "bob@example.com")
    assert code == 0
    assert auth.link_info(conn, config, link_token(out, "reset")) == ("reset", "bob@example.com")
