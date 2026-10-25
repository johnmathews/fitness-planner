import sqlite3
import threading
import time
from dataclasses import replace
from typing import Any

import pytest
from argon2 import PasswordHasher, profiles

from fitness_planner_api import auth
from fitness_planner_api.auth import AuthError
from fitness_planner_api.config import Config
from fitness_planner_api.db import connect

from .conftest import Clock

PASSWORD = "correct horse battery"
DAY = 86_400


def make_user(conn: sqlite3.Connection, config: Config, name: str = "alice@example.com") -> int:
    token = auth.mint_link(conn, config, "invite", name)
    return auth.redeem(conn, config, token, PASSWORD)


def test_production_hasher_uses_argon2_cffi_defaults() -> None:
    # The conftest swaps in a cheap hasher; the module's own default must be the RFC 9106 profile.
    fresh = PasswordHasher()
    assert fresh.memory_cost == profiles.RFC_9106_LOW_MEMORY.memory_cost == 65536
    assert auth.DEFAULT_HASHER.memory_cost == fresh.memory_cost
    assert auth.DEFAULT_HASHER.time_cost == fresh.time_cost


def test_hashing_runs_one_at_a_time(monkeypatch: pytest.MonkeyPatch) -> None:
    running = 0
    peak = 0
    lock = threading.Lock()

    class Slow:
        def hash(self, password: str) -> str:
            nonlocal running, peak
            with lock:
                running += 1
                peak = max(peak, running)
            time.sleep(0.02)
            with lock:
                running -= 1
            return "h"

    monkeypatch.setattr(auth, "HASHER", Slow())
    threads = [threading.Thread(target=auth.hash_password, args=("pw",)) for _ in range(4)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert peak == 1


def test_invite_then_login(conn: sqlite3.Connection, config: Config) -> None:
    uid = make_user(conn, config)
    assert auth.login(conn, config, "alice@example.com", PASSWORD) == uid
    assert auth.login(conn, config, "ALICE@example.com", PASSWORD) == uid  # usernames ignore case


@pytest.mark.parametrize(
    ("name", "password"), [("alice@example.com", "wrong password!"), ("nobody", PASSWORD)]
)
def test_wrong_password_and_unknown_user_look_the_same(
    conn: sqlite3.Connection,
    config: Config,
    name: str,
    password: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    make_user(conn, config)
    verified: list[str] = []
    real = auth.verify_password

    def counting(password_hash: str, password: str) -> bool:
        verified.append(password_hash)
        return real(password_hash, password)

    monkeypatch.setattr(auth, "verify_password", counting)
    with pytest.raises(AuthError) as e:
        auth.login(conn, config, name, password)
    assert e.value.code == "invalid"
    assert len(verified) == 1  # an unknown user still costs one hash


def test_five_failures_lock_the_account_for_fifteen_minutes(
    conn: sqlite3.Connection, config: Config, clock: Clock
) -> None:
    make_user(conn, config)
    for _ in range(5):
        with pytest.raises(AuthError, match="invalid"):
            auth.login(conn, config, "alice@example.com", "wrong password!")
    with pytest.raises(AuthError) as e:
        auth.login(conn, config, "alice@example.com", PASSWORD)  # right password, still locked
    assert e.value.code == "locked"
    assert e.value.retry_after == 15 * 60
    clock.advance(15 * 60)
    assert auth.login(conn, config, "alice@example.com", PASSWORD)


def test_failures_older_than_the_window_do_not_count(
    conn: sqlite3.Connection, config: Config, clock: Clock
) -> None:
    make_user(conn, config)
    for _ in range(4):
        with pytest.raises(AuthError):
            auth.login(conn, config, "alice@example.com", "wrong password!")
    clock.advance(15 * 60 + 1)
    with pytest.raises(AuthError, match="invalid"):
        auth.login(conn, config, "alice@example.com", "wrong password!")
    assert auth.login(conn, config, "alice@example.com", PASSWORD)


def test_success_resets_the_failure_count(conn: sqlite3.Connection, config: Config) -> None:
    make_user(conn, config)
    for _ in range(4):
        with pytest.raises(AuthError):
            auth.login(conn, config, "alice@example.com", "wrong password!")
    auth.login(conn, config, "alice@example.com", PASSWORD)
    for _ in range(4):
        with pytest.raises(AuthError, match="invalid"):
            auth.login(conn, config, "alice@example.com", "wrong password!")
    assert auth.login(conn, config, "alice@example.com", PASSWORD)


def test_a_disabled_user_cannot_log_in_and_loses_sessions(
    conn: sqlite3.Connection, config: Config
) -> None:
    uid = make_user(conn, config)
    token = auth.create_session(conn, config, uid)
    auth.set_disabled(conn, "alice@example.com", True)
    assert auth.session_user(conn, config, token) is None
    with pytest.raises(AuthError, match="invalid"):
        auth.login(conn, config, "alice@example.com", PASSWORD)
    auth.set_disabled(conn, "alice@example.com", False)
    assert auth.login(conn, config, "alice@example.com", PASSWORD) == uid


def test_sessions_slide_and_expire(conn: sqlite3.Connection, config: Config, clock: Clock) -> None:
    uid = make_user(conn, config)
    token = auth.create_session(conn, config, uid)
    user = auth.session_user(conn, config, token)
    assert user is not None and (user.id, user.username, user.refreshed) == (
        uid,
        "alice@example.com",
        False,
    )
    clock.advance(DAY + 1)
    user = auth.session_user(conn, config, token)
    assert user is not None and user.refreshed  # more than a day since the last refresh
    clock.advance(89 * DAY)
    assert (
        auth.session_user(conn, config, token) is not None
    )  # 90 days from the refresh, not the start
    clock.advance(90 * DAY)
    assert auth.session_user(conn, config, token) is None
    assert conn.execute("SELECT count(*) FROM sessions").fetchone()[0] == 0


def test_sessions_are_stored_hashed(conn: sqlite3.Connection, config: Config) -> None:
    uid = make_user(conn, config)
    token = auth.create_session(conn, config, uid)
    stored = [r[0] for r in conn.execute("SELECT token_hash FROM sessions")]
    assert token not in stored and stored == [auth.token_hash(token)]
    assert auth.session_user(conn, config, "not-a-token") is None


def test_ending_sessions(conn: sqlite3.Connection, config: Config) -> None:
    uid = make_user(conn, config)
    a, b = auth.create_session(conn, config, uid), auth.create_session(conn, config, uid)
    auth.end_session(conn, a)
    assert auth.session_user(conn, config, a) is None
    assert auth.session_user(conn, config, b) is not None
    assert auth.revoke_sessions(conn, "alice@example.com") == 1
    assert auth.session_user(conn, config, b) is None


def test_invite_links_are_single_use_and_expire(
    conn: sqlite3.Connection, config: Config, clock: Clock
) -> None:
    token = auth.mint_link(conn, config, "invite", "bob@example.com")
    assert auth.link_info(conn, config, token) == ("invite", "bob@example.com")
    auth.redeem(conn, config, token, PASSWORD)
    assert auth.link_info(conn, config, token) is None
    with pytest.raises(AuthError, match="gone"):
        auth.redeem(conn, config, token, PASSWORD)
    late = auth.mint_link(conn, config, "invite", "carol@example.com")
    clock.advance(7 * DAY)
    assert auth.link_info(conn, config, late) is None
    with pytest.raises(AuthError, match="gone"):
        auth.redeem(conn, config, late, PASSWORD)


def test_a_new_link_revokes_the_earlier_one(conn: sqlite3.Connection, config: Config) -> None:
    first = auth.mint_link(conn, config, "invite", "bob@example.com")
    second = auth.mint_link(conn, config, "invite", "Bob@example.com")
    assert auth.link_info(conn, config, first) is None
    assert auth.link_info(conn, config, second) == ("invite", "bob@example.com")


def test_cannot_invite_an_existing_user_or_reset_a_missing_one(
    conn: sqlite3.Connection, config: Config
) -> None:
    make_user(conn, config)
    with pytest.raises(AuthError, match="exists"):
        auth.mint_link(conn, config, "invite", "Alice@example.com")
    with pytest.raises(AuthError, match="no-user"):
        auth.mint_link(conn, config, "reset", "nobody")


@pytest.mark.parametrize(
    "name", ["", "alice", "a b@example.com", "ál@example.com", "x" * 243 + "@example.com"]
)
def test_invites_name_an_email(conn: sqlite3.Connection, config: Config, name: str) -> None:
    with pytest.raises(AuthError, match="email"):
        auth.mint_link(conn, config, "invite", name)


def test_an_invite_is_for_the_email_trimmed_and_lower_cased(
    conn: sqlite3.Connection, config: Config
) -> None:
    token = auth.mint_link(conn, config, "invite", " Dana@Example.COM ")
    assert auth.link_info(conn, config, token) == ("invite", "dana@example.com")
    assert auth.redeem(conn, config, token, PASSWORD)
    assert auth.login(conn, config, "dana@example.com", PASSWORD)


def test_a_legacy_username_account_still_signs_in(conn: sqlite3.Connection, config: Config) -> None:
    """Accounts invited before invites took an email keep their name and their sign-in."""
    conn.execute(
        "INSERT INTO users (username, password_hash, created_at) VALUES ('john', ?, 0)",
        (auth.hash_password(PASSWORD),),
    )
    assert auth.login(conn, config, "john", PASSWORD)
    assert auth.link_info(conn, config, auth.mint_link(conn, config, "reset", "john"))


def test_reset_sets_the_password_ends_sessions_and_unlocks(
    conn: sqlite3.Connection, config: Config, clock: Clock
) -> None:
    uid = make_user(conn, config)
    session = auth.create_session(conn, config, uid)
    for _ in range(5):
        with pytest.raises(AuthError):
            auth.login(conn, config, "alice@example.com", "wrong password!")
    token = auth.mint_link(conn, config, "reset", "alice@example.com")
    assert auth.link_info(conn, config, token) == ("reset", "alice@example.com")
    assert auth.redeem(conn, config, token, "a brand new password") == uid
    assert auth.session_user(conn, config, session) is None
    assert auth.login(conn, config, "alice@example.com", "a brand new password") == uid
    with pytest.raises(AuthError, match="invalid"):
        auth.login(conn, config, "alice@example.com", PASSWORD)


def test_reset_links_last_a_day(conn: sqlite3.Connection, config: Config, clock: Clock) -> None:
    make_user(conn, config)
    token = auth.mint_link(conn, config, "reset", "alice@example.com")
    clock.advance(DAY - 1)
    assert auth.link_info(conn, config, token) is not None
    clock.advance(1)
    assert auth.link_info(conn, config, token) is None


@pytest.mark.parametrize("password", ["short", "x" * 9, "x" * 257])
def test_passwords_are_10_to_256_characters(
    conn: sqlite3.Connection, config: Config, password: str
) -> None:
    token = auth.mint_link(conn, config, "invite", "bob@example.com")
    with pytest.raises(AuthError, match="password"):
        auth.redeem(conn, config, token, password)
    assert auth.link_info(conn, config, token) is not None  # a rejected password keeps the link


def test_a_name_taken_after_the_invite_was_minted(conn: sqlite3.Connection, config: Config) -> None:
    token = auth.mint_link(conn, config, "invite", "bob@example.com")
    conn.execute(
        "INSERT INTO users (username, password_hash, created_at) VALUES ('BOB@example.com', 'h', 0)"
    )
    with pytest.raises(AuthError, match="exists"):
        auth.redeem(conn, config, token, PASSWORD)
    assert auth.link_info(conn, config, token) is not None  # rolled back, link still live


def test_two_redemptions_race_and_only_one_wins(conn: sqlite3.Connection, config: Config) -> None:
    token = auth.mint_link(conn, config, "invite", "bob@example.com")
    second = connect(config.db_path)
    results: list[Any] = []
    barrier = threading.Barrier(2)

    def go(c: sqlite3.Connection) -> None:
        barrier.wait()
        try:
            results.append(auth.redeem(c, config, token, PASSWORD))
        except AuthError as e:
            results.append(e.code)

    threads = [threading.Thread(target=go, args=(c,)) for c in (conn, second)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    second.close()
    assert sorted(map(str, results))[1] == "gone"
    assert conn.execute("SELECT count(*) FROM users").fetchone()[0] == 1


def test_a_lock_set_while_hashing_wins_over_a_correct_password(
    conn: sqlite3.Connection, config: Config, clock: Clock, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Requests already waiting for the hasher when a lock lands must not slip past or clear it."""
    make_user(conn, config)
    real = auth.verify_password

    def lock_meanwhile(password_hash: str, password: str) -> bool:
        conn.execute("UPDATE users SET locked_until = ?", (clock() + 900,))
        return real(password_hash, password)

    monkeypatch.setattr(auth, "verify_password", lock_meanwhile)
    with pytest.raises(AuthError) as e:
        auth.login(conn, config, "alice@example.com", PASSWORD)
    assert e.value.code == "locked"
    with pytest.raises(AuthError, match="locked"):
        auth.login(conn, config, "alice@example.com", "wrong password!")
    # Neither attempt cleared the lock or counted towards a new one.
    row = conn.execute("SELECT failed_logins, locked_until FROM users").fetchone()
    assert (row[0], row[1]) == (0, clock() + 900)


def test_logins_beyond_the_queue_are_turned_away(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(auth, "_WAITING", threading.BoundedSemaphore(1))
    assert auth._WAITING.acquire(blocking=False)
    try:
        with pytest.raises(AuthError) as e:
            auth.hash_password("pw")
        assert (e.value.code, e.value.retry_after) == ("busy", 1)
    finally:
        auth._WAITING.release()


def test_a_login_that_waits_too_long_for_the_hasher_is_turned_away(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(auth, "HASH_WAIT", 0.01)
    monkeypatch.setattr(auth, "_HASHING", threading.Semaphore(0))  # someone else is hashing
    with pytest.raises(AuthError, match="busy"):
        auth.verify_password("h", "pw")
    assert auth._WAITING.acquire(blocking=False)  # the queue slot was given back
    auth._WAITING.release()


# --- sign-up ------------------------------------------------------------------------------------


def test_signup_stores_the_email_lower_cased_and_signs_in_by_it(
    conn: sqlite3.Connection, config: Config
) -> None:
    uid = auth.signup(conn, config, "  Bob@Example.COM ", PASSWORD)
    row = conn.execute("SELECT username FROM users WHERE id = ?", (uid,)).fetchone()
    assert row["username"] == "bob@example.com"
    assert auth.login(conn, config, "bob@example.com", PASSWORD) == uid
    assert auth.login(conn, config, "BOB@example.com", PASSWORD) == uid


@pytest.mark.parametrize(
    "email",
    [
        "",
        "bob",
        "bob@",
        "@example.com",
        "bob@example",
        "bob@.com",
        "bob@example..com",
        "b ob@example.com",
        "bob@exa_mple.com",
        "a@b@example.com",
        "jö@example.com",  # Latin-1: a header could carry it, but the rule is ASCII
        "用户@example.com",  # beyond Latin-1: fetch cannot send it in X-Expected-User
        "a" * 243 + "@example.com",  # 255 characters
    ],
)
def test_signup_refuses_what_is_not_an_ascii_email(
    conn: sqlite3.Connection, config: Config, email: str
) -> None:
    with pytest.raises(AuthError) as e:
        auth.signup(conn, config, email, PASSWORD)
    assert e.value.code == "email"


def test_signup_accepts_a_254_character_email(conn: sqlite3.Connection, config: Config) -> None:
    email = "a" * 242 + "@example.com"
    assert len(email) == 254
    auth.signup(conn, config, email, PASSWORD)


@pytest.mark.parametrize("password", ["x" * 9, "x" * 257])
def test_signup_password_length(conn: sqlite3.Connection, config: Config, password: str) -> None:
    with pytest.raises(AuthError) as e:
        auth.signup(conn, config, "bob@example.com", password)
    assert e.value.code == "password"


def test_signup_refuses_a_taken_email_in_any_case(conn: sqlite3.Connection, config: Config) -> None:
    auth.signup(conn, config, "bob@example.com", PASSWORD)
    with pytest.raises(AuthError) as e:
        auth.signup(conn, config, "Bob@Example.com", PASSWORD)
    assert e.value.code == "exists"


@pytest.mark.parametrize("max_users", [0, 1])
def test_signup_closes_at_max_users_counting_invited_accounts(
    conn: sqlite3.Connection, config: Config, max_users: int, monkeypatch: pytest.MonkeyPatch
) -> None:
    config = replace(config, max_users=max_users)
    if max_users:
        make_user(conn, config)  # an invited account takes the one place
    hashed: list[str] = []

    def counting(password: str) -> str:
        hashed.append(password)
        return "h"

    monkeypatch.setattr(auth, "hash_password", counting)
    with pytest.raises(AuthError) as e:
        auth.signup(conn, config, "bob@example.com", PASSWORD)
    assert e.value.code == "closed"
    assert hashed == []  # refused before paying for a hash


def test_signup_allows_ten_an_hour(conn: sqlite3.Connection, config: Config, clock: Clock) -> None:
    for i in range(10):
        auth.signup(conn, config, f"u{i}@example.com", PASSWORD)
        clock.advance(60)
    with pytest.raises(AuthError) as e:
        auth.signup(conn, config, "late@example.com", PASSWORD)
    assert e.value.code == "too-many"
    assert e.value.retry_after == 3600 - 600  # until the first of the ten leaves the hour
    clock.advance(3600 - 600)
    auth.signup(conn, config, "late@example.com", PASSWORD)


def test_invited_accounts_do_not_count_towards_the_hourly_limit(
    conn: sqlite3.Connection, config: Config
) -> None:
    for i in range(10):
        make_user(conn, config, f"friend{i}@example.com")
    auth.signup(conn, config, "bob@example.com", PASSWORD)


def test_parallel_signups_cannot_pass_the_cap(conn: sqlite3.Connection, config: Config) -> None:
    config = replace(config, max_users=1)
    second = connect(config.db_path)
    results: list[Any] = []
    barrier = threading.Barrier(2)

    def go(c: sqlite3.Connection, email: str) -> None:
        barrier.wait()
        try:
            results.append(auth.signup(c, config, email, PASSWORD))
        except AuthError as e:
            results.append(e.code)

    threads = [
        threading.Thread(target=go, args=(c, e))
        for c, e in ((conn, "a@example.com"), (second, "b@example.com"))
    ]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    second.close()
    assert sorted(map(str, results))[1] == "closed"
    assert conn.execute("SELECT count(*) FROM users").fetchone()[0] == 1


def test_parallel_signups_for_one_email_make_one_account(
    conn: sqlite3.Connection, config: Config
) -> None:
    second = connect(config.db_path)
    results: list[Any] = []
    barrier = threading.Barrier(2)

    def go(c: sqlite3.Connection) -> None:
        barrier.wait()
        try:
            results.append(auth.signup(c, config, "bob@example.com", PASSWORD))
        except AuthError as e:
            results.append(e.code)

    threads = [threading.Thread(target=go, args=(c,)) for c in (conn, second)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    second.close()
    assert sorted(map(str, results))[1] == "exists"
    assert conn.execute("SELECT count(*) FROM users").fetchone()[0] == 1


def test_a_signed_up_account_can_be_reset_but_not_invited(
    conn: sqlite3.Connection, config: Config
) -> None:
    auth.signup(conn, config, "bob@example.com", PASSWORD)
    token = auth.mint_link(conn, config, "reset", "bob@example.com")
    assert auth.link_info(conn, config, token) == ("reset", "bob@example.com")
    with pytest.raises(AuthError) as e:
        auth.mint_link(conn, config, "invite", "BOB@example.com")
    assert e.value.code == "exists"
